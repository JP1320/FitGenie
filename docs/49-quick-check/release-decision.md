# Release Decision Rule

Go to production only if:
- P0 bugs = 0
- P1 bugs <= 2 with workaround
- API success >= 99.5% in staging tests
- Core MVP flow passes end-to-end
