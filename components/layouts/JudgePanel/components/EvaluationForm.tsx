import React from 'react';
import { Box, Paper, Typography, Grid, Chip, alpha, Rating, TextField, Button, CircularProgress } from '@mui/material';

export const EvaluationForm = ({ 
  criteriaList, evaluation, feedback, evalData, entry, colors, 
  isFormValid, submitMutation, mode, handleRatingChange, setFeedback, handleSubmit
}: any) => {
  return (
    <Paper elevation={0} sx={{ p: { xs: 4, md: 5 }, borderRadius: 4, border: `1px solid ${colors.BORDER}`, mt: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4, pb: 2, borderBottom: `1px solid ${colors.BORDER}` }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
            Scoring & Evaluation
          </Typography>
          <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY, mt: 0.5 }}>
            Please provide your evaluation criteria score and feedback below.
          </Typography>
        </Box>
        {evalData && (
          <Chip label={`Current Total: ${evalData?.total_score || entry?.totalScore || 0} / ${evalData?.max_score || 10}`} sx={{ fontWeight: 700, fontSize: '1rem', bgcolor: alpha(colors.PRIMARY, 0.1), color: colors.PRIMARY }} />
        )}
      </Box>

      <Grid container spacing={5}>
        {criteriaList.map((criteria: any, idx: number) => (
          <Grid size={{xs: 12}} key={idx}>
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', mb: 1.5 }}>
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 700, textTransform: 'capitalize', color: colors.TEXT_PRIMARY }}>{criteria.description}</Typography>
                  <Typography variant="body2" sx={{ color: colors.TEXT_SECONDARY }}>Evaluate out of {criteria.weighting} points.</Typography>
                </Box>
                <Typography variant="h6" sx={{ fontWeight: 800, color: colors.PRIMARY }}>
                  {evaluation[criteria.description] || 0} <Typography component="span" variant="body2" sx={{ color: colors.TEXT_SECONDARY, fontWeight: 600 }}>/ {criteria.weighting}</Typography>
                </Typography>
              </Box>
              <Box sx={{ bgcolor: alpha(colors.PRIMARY, 0.03), p: 3, borderRadius: 3, border: `1px solid ${alpha(colors.PRIMARY, 0.1)}` }}>
                <Rating max={Number(criteria.weighting) || 5} value={evaluation[criteria.description] || 0} onChange={(_, val) => handleRatingChange(criteria.description, val)} size="large" sx={{ color: colors.PRIMARY }} />
              </Box>
            </Box>
          </Grid>
        ))}
        {criteriaList.length === 0 && (
          <Grid size={{xs: 12}}>
            <Typography variant="body1" sx={{ mt: 2 }}>No evaluation criteria defined for this contest.</Typography>
          </Grid>
        )}
        <Grid size={{xs: 12}}>
          <Box sx={{ mt: 1 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: colors.TEXT_PRIMARY }}>Feedback / Comments (Optional)</Typography>
            <TextField
              fullWidth
              multiline
              rows={4}
              placeholder="Write your constructive feedback for the participant here..."
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  bgcolor: alpha(colors.PRIMARY, 0.02),
                  "&:hover fieldset": { borderColor: colors.PRIMARY },
                }
              }}
            />
          </Box>
        </Grid>
      </Grid>

      <Box sx={{ mt: 5, pt: 3, borderTop: `1px solid ${colors.BORDER}`, display: 'flex', justifyContent: 'flex-end' }}>
        <Button
          variant="contained"
          disabled={!isFormValid || submitMutation.isPending}
          onClick={handleSubmit}
          sx={{ bgcolor: colors.PRIMARY, color: "#fff", fontWeight: 700, px: 5, py: 1.5, borderRadius: 2, fontSize: '1.05rem', boxShadow: `0 8px 16px -4px ${alpha(colors.PRIMARY, 0.4)}`, transition: 'all 0.2s ease', '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 12px 20px -4px ${alpha(colors.PRIMARY, 0.5)}` } }}
        >
          {submitMutation.isPending ? <CircularProgress size={24} color="inherit" /> : mode === "edit" ? "Update Evaluation" : "Submit Evaluation"}
        </Button>
      </Box>
    </Paper>
  );
};
