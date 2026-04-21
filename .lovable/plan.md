

## Plan: Add properties.saw@gmail.com as Admin

The user `properties.saw@gmail.com` exists with ID `ae8e3ab6-bbc6-4a44-aedf-6e415aeb0a15`.

### Action
Insert a row into `user_roles` table:
```sql
INSERT INTO user_roles (user_id, role) 
VALUES ('ae8e3ab6-bbc6-4a44-aedf-6e415aeb0a15', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;
```

This is a data operation only — no code changes needed.

