# Notes API Edge Function

Fetches notes for the API key owner on a specific date.

## Endpoint

`GET /functions/v1/notes-api?date=YYYY-MM-DD`

### Headers

- `Authorization: Bearer dm_<your-api-key>`

### Query parameters

| Name | Required | Description |
| ---- | -------- | ----------- |
| `date` | Yes | Calendar date in `YYYY-MM-DD` format (UTC day bounds) |

### Response

```json
{
  "date": "2026-07-01",
  "notes": [
    {
      "id": "uuid",
      "content": "markdown content",
      "isPinned": false,
      "createdAt": "2026-07-01T12:00:00.000Z",
      "updatedAt": "2026-07-01T12:00:00.000Z"
    }
  ]
}
```

## Required environment variables

These are provided automatically when deployed to Supabase:

| Variable | Description |
| -------- | ----------- |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Service role key for privileged database access |

For local development with `supabase functions serve`, ensure the service role key is available (typically via `supabase status` or your local `.env`).

## Deploy

```bash
supabase functions deploy notes-api
```

`verify_jwt` is disabled for this function because authentication uses API keys instead of Supabase session JWTs.
