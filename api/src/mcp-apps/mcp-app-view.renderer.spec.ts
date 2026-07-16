import { renderMcpAppView } from './mcp-app-view.renderer';
import type { McpAppRecord } from './mcp-app.repository';

const makeApp = (name = 'Orders'): McpAppRecord => ({
  id: 'app-1', name, serverId: 'server-1', toolName: 'list_orders',
  viewType: 'table', viewConfig: { dataPath: 'items', columns: ['id'] }, isActive: true,
  createdAt: new Date(), updatedAt: new Date(),
});

describe('renderMcpAppView', () => {
  it('creates a self-contained MCP App document with host handshake and refresh support', () => {
    const html = renderMcpAppView(makeApp());

    expect(html).toContain('<!doctype html>');
    expect(html).toContain("protocolVersion='2026-01-26'");
    expect(html).toContain("request('ui/initialize'");
    expect(html).toContain("notify('ui/notifications/initialized'");
    expect(html).toContain("request('tools/call'");
    expect(html).toContain("message.method==='ui/notifications/tool-result'");
  });

  it('escapes configuration embedded in the script element', () => {
    const html = renderMcpAppView(makeApp('</script><script>alert(1)</script>'));

    expect(html).not.toContain('</script><script>alert(1)</script>');
    expect(html).toContain('\\u003c/script\\u003e');
  });
});
