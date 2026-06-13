import { ExpandLess, ExpandMore, History } from '@mui/icons-material';
import { alpha, Box, Chip, Collapse, Grid, IconButton, Paper, Typography } from '@mui/material';
import React from 'react';

export const EvaluationHistory = ({ evalData, colors }: { evalData: any, colors: any }) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!evalData?.history || evalData.history.length <= 1) {
    return null; // Don't show history if there are no past versions (only 1 entry means it's just the current one)
  }

  // Filter out the most recent history item because it is exactly the same as the current evaluation
  const pastHistory = evalData.history.slice(1);

  if (pastHistory.length === 0) return null;

  return (
    <Box sx={{ mt: 5, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
        <History sx={{ color: colors.TEXT_SECONDARY }} />
        <Typography variant="h6" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
          Evaluation History
        </Typography>
        <Chip label={`${pastHistory.length} ${pastHistory.length === 1 ? 'Version' : 'Versions'}`} size="small" sx={{ ml: 1, bgcolor: alpha(colors.TEXT_SECONDARY, 0.1), color: colors.TEXT_SECONDARY, fontWeight: 600 }} />
      </Box>

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        {pastHistory.map((historyItem: any, index: number) => {
          const isExpanded = expandedId === historyItem.id;
          const date = new Date(historyItem.created_at).toLocaleString(undefined, {
            dateStyle: "medium",
            timeStyle: "short",
          });

          return (
            <Paper
              key={historyItem.id}
              elevation={0}
              sx={{
                borderRadius: 3,
                border: `1px solid ${colors.BORDER}`,
                overflow: 'hidden',
                transition: "all 0.2s ease-in-out",
                "&:hover": { borderColor: alpha(colors.TEXT_SECONDARY, 0.3) }
              }}
            >
              <Box
                onClick={() => setExpandedId(isExpanded ? null : historyItem.id)}
                sx={{
                  p: 2.5,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer',
                  bgcolor: isExpanded ? alpha(colors.TEXT_SECONDARY, 0.02) : 'transparent',
                }}
              >
                <Box>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: colors.TEXT_PRIMARY }}>
                    Prior Evaluation {pastHistory.length - index}
                  </Typography>
                  <Typography variant="caption" sx={{ color: colors.TEXT_SECONDARY, mt: 0.5, display: 'block' }}>
                    Evaluated on: {date}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                  <Typography variant="subtitle1" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                    Score: {historyItem.total_score} / {historyItem.max_score}
                  </Typography>
                  <IconButton size="small" sx={{ color: colors.TEXT_SECONDARY }}>
                    {isExpanded ? <ExpandLess /> : <ExpandMore />}
                  </IconButton>
                </Box>
              </Box>

              <Collapse in={isExpanded}>
                <Box sx={{ p: 3, pt: 0, borderTop: `1px solid ${colors.BORDER}`, bgcolor: alpha(colors.TEXT_SECONDARY, 0.01) }}>
                  <Typography variant="caption" sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5, mb: 2, display: 'block', mt: 2 }}>
                    Criteria Scores
                  </Typography>
                  <Grid container spacing={2}>
                    {historyItem?.scores?.map((s: any, idx: number) => (
                      <Grid size={{xs:12,sm:6,md:4}} key={idx}>
                        <Box sx={{ p: 1.5, borderRadius: 2, bgcolor: alpha(colors.TEXT_SECONDARY, 0.05), display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY, fontWeight: 600, textTransform: 'capitalize' }}>
                            {s.description}
                          </Typography>
                          <Typography variant="body2" sx={{ fontWeight: 800, color: colors.TEXT_PRIMARY }}>
                            {s.score} <Typography component="span" variant="caption" sx={{ color: colors.TEXT_SECONDARY }}>/ {s.weighting}</Typography>
                          </Typography>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>

                  {historyItem?.feedback && (
                    <Box sx={{ mt: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: colors.TEXT_SECONDARY, textTransform: 'uppercase', letterSpacing: 0.5, mb: 1, display: 'block' }}>
                        Feedback
                      </Typography>
                      <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: "rgba(0,0,0,0.02)", border: `1px solid ${colors.BORDER}` }}>
                        <Typography variant="body2" sx={{ color: colors.TEXT_PRIMARY, fontStyle: 'italic', whiteSpace: 'pre-wrap' }}>
                          "{historyItem.feedback}"
                        </Typography>
                      </Paper>
                    </Box>
                  )}
                </Box>
              </Collapse>
            </Paper>
          );
        })}
      </Box>
    </Box>
  );
};
