import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Box, Button, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material'
import {
  IconRocket,
  IconTool,
  IconLock,
  IconCircleCheck,
  IconArrowRight,
} from '@tabler/icons-react'

export default function SetupWizard() {
  const navigate = useNavigate()
  const { t } = useTranslation('auth')
  const [step, setStep] = useState(0)

  const STEPS = [
    t('wizard.step.welcome'),
    t('wizard.step.whatYouCanDo'),
    t('wizard.step.securityTip'),
    t('wizard.step.youreReady'),
  ]

  const SLIDES = [
    {
      icon: <IconRocket size={64} color="var(--mui-palette-primary-main)" />,
      title: t('wizard.slide.welcome.title'),
      body: t('wizard.slide.welcome.body'),
    },
    {
      icon: <IconTool size={64} color="var(--mui-palette-secondary-main)" />,
      title: t('wizard.slide.howItWorks.title'),
      body: (
        <Box component="ol" sx={{ pl: 2.5, m: 0, '& li': { mb: 1.5 } }}>
          <li><strong>Create a server</strong> — give it a name and upload your API documentation (OpenAPI / Swagger) or paste the URL. If you don't have the file, try pasting the API base URL and clicking "Discover".</li>
          <li><strong>Configure access</strong> — add the API credentials (token, key, password). They are stored securely and injected automatically on every request.</li>
          <li><strong>Copy the MCP URL</strong> — paste it in your AI client's settings. That's it — your assistant can now use the API.</li>
        </Box>
      ),
    },
    {
      icon: <IconLock size={64} color="var(--mui-palette-warning-main)" />,
      title: t('wizard.slide.keepSecure.title'),
      body: (
        <Box>
          <Typography variant="body1" mb={2}>
            {t('wizard.slide.keepSecure.intro')}
          </Typography>
          <Box component="ul" sx={{ pl: 2.5, m: 0, '& li': { mb: 1 } }}>
            <li><strong>Add an MCP API key</strong> — found in each server under "MCP Authentication". Every client must include it in their configuration.</li>
            <li><strong>Use the Share with client button</strong> — generates step-by-step setup instructions for your clients, with the key already filled in.</li>
            <li><strong>Enable Rate Limiting</strong> — prevents your API from being overwhelmed.</li>
          </Box>
        </Box>
      ),
    },
    {
      icon: <IconCircleCheck size={64} color="var(--mui-palette-success-main)" />,
      title: t('wizard.slide.allSet.title'),
      body: t('wizard.slide.allSet.body'),
    },
  ]

  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  const finish = () => {
    localStorage.setItem('setupComplete', '1')
    navigate('/')
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="background.default" p={3}>
      <Paper variant="outlined" sx={{ maxWidth: 640, width: '100%', p: 4, borderRadius: 2 }}>
        <Stepper activeStep={step} sx={{ mb: 4 }}>
          {STEPS.map((label, i) => (
            <Step key={label} completed={step > i}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        <Box display="flex" flexDirection="column" alignItems="center" textAlign="center" mb={4}>
          {slide.icon}
          <Typography variant="h5" fontWeight={700} mt={2.5} mb={2}>{slide.title}</Typography>
          {typeof slide.body === 'string'
            ? <Typography variant="body1" color="text.secondary" maxWidth={500}>{slide.body}</Typography>
            : <Box textAlign="left" width="100%">{slide.body}</Box>}
        </Box>

        <Box display="flex" justifyContent="space-between">
          <Button onClick={() => step === 0 ? finish() : setStep(s => s - 1)}>
            {step === 0 ? t('action.skip') : t('action.back')}
          </Button>
          {!isLast && (
            <Button variant="contained" endIcon={<IconArrowRight size={18} />} onClick={() => setStep(s => s + 1)}>
              {t('action.next')}
            </Button>
          )}
          {isLast && (
            <Button variant="contained" color="success" startIcon={<IconRocket size={18} />} onClick={finish}>
              {t('action.createFirstServer')}
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
