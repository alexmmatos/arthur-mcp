import { BadRequestException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as yaml from 'js-yaml';
import { parseSpec } from '../dynamic-mcp/openapi-parser';
import { generateTools } from '../dynamic-mcp/tool-generator';
import type { AuthConfig } from '../dynamic-mcp/types';
import {
  SwaggerProject,
  SwaggerProjectDocument,
} from './swagger-project.schema';

@Injectable()
export class SwaggerService {
  private readonly logger = new Logger(SwaggerService.name);

  constructor(
    @InjectModel(SwaggerProject.name)
    private readonly projectModel: Model<SwaggerProjectDocument>,
  ) {}

  /** Parse YAML ou JSON para objeto */
  private parseContent(content: string, filename: string): Record<string, any> {
    try {
      const lower = filename.toLowerCase();
      if (lower.endsWith('.yaml') || lower.endsWith('.yml')) {
        return yaml.load(content) as Record<string, any>;
      }
      return JSON.parse(content);
    } catch {
      throw new BadRequestException(
        'Não foi possível fazer o parse do arquivo. Verifique se é um JSON ou YAML válido.',
      );
    }
  }

  /** Valida versão mínima do spec */
  private validateSpec(spec: Record<string, any>): void {
    const isSwagger2 = spec.swagger === '2.0';
    const isOpenApi3 = typeof spec.openapi === 'string' && spec.openapi.startsWith('3.');
    if (!isSwagger2 && !isOpenApi3) {
      throw new BadRequestException(
        'Arquivo inválido: deve ser Swagger 2.0 ou OpenAPI 3.x.',
      );
    }
    if (!spec.paths || Object.keys(spec.paths).length === 0) {
      throw new BadRequestException(
        'Arquivo inválido: nenhum endpoint (paths) encontrado.',
      );
    }
  }

  /**
   * Cria um projeto a partir do conteúdo do arquivo.
   * 1. Parse YAML/JSON
   * 2. Validação rápida
   * 3. Passa para swagger-parser (resolve $ref)
   * 4. Gera tools com inputSchema + endpointRef/parameterMap
   * 5. Persiste no MongoDB
   */
  async create(
    content: string,
    filename: string,
    baseUrlOverride?: string,
    auth?: AuthConfig,
  ): Promise<SwaggerProjectDocument> {
    const rawSpec = this.parseContent(content, filename);
    this.validateSpec(rawSpec);

    let normalizedSpec: Awaited<ReturnType<typeof parseSpec>>;
    try {
      normalizedSpec = await parseSpec(rawSpec);
    } catch (err: any) {
      throw new BadRequestException(`Erro ao processar o spec: ${err?.message ?? err}`);
    }

    const baseUrl = baseUrlOverride?.trim() || normalizedSpec.servers[0]?.url || 'http://localhost';
    const tools = generateTools(normalizedSpec, baseUrl);

    this.logger.log(
      `Projeto "${normalizedSpec.info.title}" importado: ${tools.length} tools geradas`,
    );

    return this.projectModel.create({
      name: normalizedSpec.info.title ?? filename.replace(/\.(ya?ml|json)$/i, ''),
      baseUrl,
      description: normalizedSpec.info.description,
      version: normalizedSpec.info.version,
      rawSpec,
      tools,
      auth: auth ?? { type: 'none' },
      status: 'active',
    });
  }

  findAll(): Promise<SwaggerProjectDocument[]> {
    return this.projectModel
      .find()
      .select('-rawSpec -tools.endpointRef')  // exclui campos pesados da listagem
      .sort({ createdAt: -1 })
      .exec();
  }

  async findOne(id: string): Promise<SwaggerProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Projeto não encontrado.');
    return project;
  }

  async remove(id: string): Promise<void> {
    const project = await this.projectModel.findByIdAndDelete(id).exec();
    if (!project) throw new NotFoundException('Projeto não encontrado.');
  }

  /** Atualiza somente a configuração de auth do projeto */
  async updateAuth(id: string, auth: AuthConfig): Promise<SwaggerProjectDocument> {
    const project = await this.projectModel
      .findByIdAndUpdate(id, { auth }, { new: true })
      .exec();
    if (!project) throw new NotFoundException('Projeto não encontrado.');
    return project;
  }

  /**
   * Atualiza a baseUrl do projeto e propaga para endpointRef de todas as tools.
   * É necessário atualizar endpointRef.baseUrl porque é lido em tempo de execução
   * pelo DynamicMcpService sem re-parsear o spec.
   */
  async updateBaseUrl(id: string, baseUrl: string): Promise<SwaggerProjectDocument> {
    const project = await this.projectModel.findById(id).exec();
    if (!project) throw new NotFoundException('Projeto não encontrado.');

    project.baseUrl = baseUrl;
    project.tools = (project.tools ?? []).map((t) => ({
      ...t,
      endpointRef: t.endpointRef ? { ...t.endpointRef, baseUrl } : t.endpointRef,
    })) as typeof project.tools;
    project.markModified('tools');

    return project.save();
  }
}
