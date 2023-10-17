USE legacyDB;

EXEC sys.sp_cdc_enable_db;

EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'legacy_produkte', @role_name = NULL, @supports_net_changes = 0;

EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'legacy_kunden', @role_name = NULL, @supports_net_changes = 0;

EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'legacy_bestellungen', @role_name = NULL, @supports_net_changes = 0;
