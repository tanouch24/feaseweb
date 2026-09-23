-- FeaseWeb V8.1: add the prospect role in its own transaction.
-- It must be committed before any later migration uses the enum value.
alter type public.app_role add value if not exists 'prospect';
