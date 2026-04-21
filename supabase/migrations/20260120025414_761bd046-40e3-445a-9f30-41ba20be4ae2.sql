-- Add mentioned_client_ids field to store IDs of mentioned clients for dual-person analysis
ALTER TABLE consultations 
ADD COLUMN mentioned_client_ids uuid[] DEFAULT '{}';