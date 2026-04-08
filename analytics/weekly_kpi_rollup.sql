-- Example weekly KPI rollup
SELECT
  date_trunc('week', created_at) AS week,
  COUNT(*) FILTER (WHERE event_name = 'recommendation_clicked')::float
    / NULLIF(COUNT(*) FILTER (WHERE event_name = 'recommendation_viewed'), 0) AS recommendation_ctr,
  COUNT(*) FILTER (WHERE event_name = 'booking_created')::float
    / NULLIF(COUNT(*) FILTER (WHERE event_name = 'recommendation_clicked'), 0) AS booking_conversion
FROM kpi_events
GROUP BY 1
ORDER BY 1 DESC;
