import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Container, Typography, Button, Grid, Paper } from '@mui/material';
import { Shield, Zap, Brain, TrendingUp } from 'lucide-react';

const Landing: React.FC = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: <Brain size={40} color="#00FFFF" />,
      title: 'AI-Powered Detection',
      description: 'LSTM + LightGBM ensemble with 99.68% F1-score for accurate threat identification',
    },
    {
      icon: <Zap size={40} color="#FFB300" />,
      title: 'Ultra-Fast Analysis',
      description: 'Average latency under 0.5ms per domain with real-time processing capabilities',
    },
    {
      icon: <Shield size={40} color="#00E676" />,
      title: 'Comprehensive Safelist',
      description: '143K+ verified domains with three-tier classification for precision',
    },
    {
      icon: <TrendingUp size={40} color="#00FFFF" />,
      title: 'Advanced Analytics',
      description: 'Rich visualizations and insights for threat trends and patterns',
    },
  ];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #0D1B2A 0%, #1B2838 100%)',
        backgroundImage: `
          radial-gradient(circle at 20% 50%, rgba(0, 255, 255, 0.05) 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, rgba(0, 255, 255, 0.03) 0%, transparent 50%)
        `,
      }}
    >
      {/* Hero Section */}
      <Container maxWidth="lg">
        <Box
          sx={{
            pt: { xs: 8, md: 12 },
            pb: { xs: 6, md: 10 },
            textAlign: 'center',
          }}
        >
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'rgba(0, 255, 255, 0.1)',
              borderRadius: '50%',
              p: 3,
              mb: 3,
            }}
          >
            <Shield size={64} color="#00FFFF" />
          </Box>

          <Typography
            variant="h2"
            component="h1"
            fontWeight="bold"
            gutterBottom
            sx={{
              background: 'linear-gradient(135deg, #00FFFF 0%, #FFFFFF 100%)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2,
            }}
          >
            Real-Time DNS Threat Detection
          </Typography>

          <Typography
            variant="h5"
            color="text.secondary"
            sx={{ mb: 4, maxWidth: 800, mx: 'auto' }}
          >
            Advanced AI-powered platform for detecting malicious domains with industry-leading
            accuracy and speed
          </Typography>

          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 4,
                py: 1.5,
                background: 'linear-gradient(45deg, #00FFFF 30%, #00CCCC 90%)',
                color: '#0D1B2A',
                fontWeight: 600,
                '&:hover': {
                  background: 'linear-gradient(45deg, #00CCCC 30%, #00FFFF 90%)',
                },
              }}
            >
              Get Started Free
            </Button>
            <Button
              variant="outlined"
              size="large"
              onClick={() => navigate('/login')}
              sx={{
                px: 4,
                py: 1.5,
                borderColor: '#00FFFF',
                color: '#00FFFF',
                '&:hover': {
                  borderColor: '#00CCCC',
                  backgroundColor: 'rgba(0, 255, 255, 0.1)',
                },
              }}
            >
              Sign In
            </Button>
          </Box>

          {/* Stats */}
          <Grid container spacing={4} sx={{ mt: 6 }}>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" fontWeight="bold" color="#00FFFF">
                99.68%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                F1-Score Accuracy
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" fontWeight="bold" color="#00FFFF">
                {'<0.5ms'}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Average Latency
              </Typography>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Typography variant="h3" fontWeight="bold" color="#00FFFF">
                143K+
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Safelist Domains
              </Typography>
            </Grid>
          </Grid>
        </Box>

        {/* Features Section */}
        <Box sx={{ py: 8 }}>
          <Typography
            variant="h3"
            textAlign="center"
            fontWeight="bold"
            gutterBottom
            sx={{ mb: 6 }}
          >
            Powerful Features
          </Typography>

          <Grid container spacing={4}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Paper
                  sx={{
                    p: 3,
                    height: '100%',
                    textAlign: 'center',
                    transition: 'all 0.3s',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: '0 12px 24px rgba(0, 255, 255, 0.3)',
                    },
                  }}
                >
                  <Box sx={{ mb: 2 }}>{feature.icon}</Box>
                  <Typography variant="h6" fontWeight="bold" gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ py: 8, textAlign: 'center' }}>
          <Paper
            sx={{
              p: 6,
              background: 'linear-gradient(135deg, rgba(0, 255, 255, 0.1) 0%, rgba(0, 204, 204, 0.05) 100%)',
              border: '1px solid rgba(0, 255, 255, 0.3)',
            }}
          >
            <Typography variant="h4" fontWeight="bold" gutterBottom>
              Ready to Protect Your Network?
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              Join thousands of security professionals using our platform
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={() => navigate('/register')}
              sx={{
                px: 5,
                py: 1.5,
                background: 'linear-gradient(45deg, #00FFFF 30%, #00CCCC 90%)',
                color: '#0D1B2A',
                fontWeight: 600,
              }}
            >
              Start Now
            </Button>
          </Paper>
        </Box>
      </Container>

      {/* Footer */}
      <Box
        sx={{
          borderTop: '1px solid rgba(0, 255, 255, 0.1)',
          py: 4,
          textAlign: 'center',
        }}
      >
        <Container maxWidth="lg">
          <Typography variant="body2" color="text.secondary">
            © 2025 DNS Threat Detection. Built with Advanced ML Technology.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
};

export default Landing;
