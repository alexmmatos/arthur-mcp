import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Box, Button, Paper, Step, StepLabel, Stepper, Typography } from '@mui/material'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import BuildIcon from '@mui/icons-material/Build'
import LockIcon from '@mui/icons-material/Lock'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'

const STEPS = ['Welcome', 'What you can do', 'Security tip', "You're ready"]

const SLIDES = [
  {
    icon: <RocketLaunchIcon sx={{ fontSize: 64, color: 'primary.main' }} />,
    title: 'Welcome to MCP Convert',
    body: 'This tool connects your existing APIs to AI assistants like Claude Desktop and Cursor — without writing a single line of code. Your AI will be able to search, create, update and retrieve data from any API you connect here.',
  },
  {
    icon: <BuildIcon sx={{ fontSize: 64, color: 'secondary.main' }} />,
    title: 'How it works',
    body: (
      <Box component="ol" sx={{ pl: 2.5, m: 0, '& li': { mb: 1.5 } }}>
        <li><strong>Create a server</strong> — give it a name and upload your API documentation (OpenAPI / Swagger) or paste the URL. If you don't have the file, try pasting the API base URL and clicking "Discover".</li>
        <li><strong>Configure access</strong> — add the API credentials (token, key, password). They are stored securely and injected automatically on every request.</li>
        <li><strong>Copy the MCP URL</strong> — paste it in your AI client's settings. That's it — your assistant can now use the API.</li>
      </Box>
    ),
  },
  {
    icon: <LockIcon sx={{ fontSize: 64, color: 'warning.main' }} />,
    title: 'Keep it secure',
    body: (
      <Box>
        <Typography variant="body1" mb={2}>
          Your MCP endpoint is accessible to anyone who has the URL. Before sharing it with external clients, we recommend:
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
    icon: <CheckCircleIcon sx={{ fontSize: 64, color: 'success.main' }} />,
    title: "You're all set!",
    body: 'Start by creating your first server. If you run into trouble, every panel has a help button (?) with detailed explanations. You can always come back to this guide from the Help menu.',
  },
]

export default function SetupWizard() {
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const slide = SLIDES[step]
  const isLast = step === SLIDES.length - 1

  const finish = () => {
    localStorage.setItem('setupComplete', '1')
    navigate('/')
  }

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="#f8fafc" p={3}>
      <Paper variant="outlined" sx={{ maxWidth: 640, width: '100%', p: 4, borderRadius: 3 }}>
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
          <Button onClick={() => step === 0 ? finish() : setStep(s => s - 1)} disabled={step === 0}>
            {step === 0 ? 'Skip' : 'Back'}
          </Button>
          {!isLast && (
            <Button variant="contained" endIcon={<ArrowForwardIcon />} onClick={() => setStep(s => s + 1)}>
              Next
            </Button>
          )}
          {isLast && (
            <Button variant="contained" color="success" startIcon={<RocketLaunchIcon />} onClick={finish}>
              Create my first server
            </Button>
          )}
        </Box>
      </Paper>
    </Box>
  )
}
