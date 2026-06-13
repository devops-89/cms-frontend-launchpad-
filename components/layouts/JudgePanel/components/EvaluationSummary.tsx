import { Box, Chip, Grid, Paper, Typography, alpha } from '@mui/material';

export const EvaluationSummary = ({ evalData, colors }: { evalData: any, colors: any }) => {
  if (!evalData) return null;

  return (
    <Paper elevation={0} sx={{ p: { xs: 4, md: 5 }, borderRadius: 4, border: `1px solid ${colors.BORDER}`, mt: 10, mb: 4, background: `linear-gradient(145deg, #ffffff, ${alpha(colors.PRIMARY, 0.02)})` }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, borderBottom: `1px solid ${colors.BORDER}`, pb: 3 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
            Evaluation Summary
          </Typography>
          <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, mt: 0.5 }}>
            Final scores and feedback provided by the judge.
          </Typography>
        </Box>
        <Chip label={`Total Score: ${evalData?.total_score || 0} / ${evalData?.max_score || 10}`} sx={{ fontWeight: 800, fontSize: '1.1rem', py: 2.5, px: 1, bgcolor: alpha(colors.PRIMARY, 0.1), color: colors.PRIMARY }} />
      </Box>
      <Grid container spacing={4}>
        {evalData?.scores?.map((s: any, idx: number) => (
          <Grid size={{xs: 12, md: 6}} key={idx}>
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: alpha(colors.PRIMARY, 0.03), border: `1px solid ${alpha(colors.PRIMARY, 0.08)}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center', transition: "all 0.2s ease-in-out", "&:hover": { bgcolor: alpha(colors.PRIMARY, 0.06), transform: "translateY(-2px)" } }}>
              <Typography variant="subtitle1" sx={{ color: colors.TEXT_PRIMARY, fontWeight: 600, textTransform: 'capitalize' }}>
                {s.description}
              </Typography>
              <Box sx={{ textAlign: 'right' }}>
                <Typography variant="h5" sx={{ fontWeight: 800, color: colors.PRIMARY, display: 'inline' }}>
                  {s.score}
                </Typography>
                <Typography component="span" variant="body1" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 500, ml: 0.5 }}>
                  / {s.weighting}
                </Typography>
              </Box>
            </Box>
          </Grid>
        ))}
      </Grid>
      {evalData?.feedback && (
        <Box sx={{ mt: 5 }}>
          <Typography variant="subtitle1" sx={{ color: colors.TEXT_PRIMARY, fontWeight: 700, mb: 2 }}>Judge's Feedback</Typography>
          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, bgcolor: alpha(colors.TEXT_PRIMARY, 0.02), border: `1px solid ${colors.BORDER}`, borderLeft: `4px solid ${colors.PRIMARY}` }}>
            <Typography variant="body1" sx={{ color: colors.TEXT_PRIMARY, lineHeight: 1.7, fontStyle: 'italic' }}>
              "{evalData.feedback}"
            </Typography>
          </Paper>
        </Box>
      )}
    </Paper>
  );
};
