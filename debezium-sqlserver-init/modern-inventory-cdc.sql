USE modernDB;

EXEC sys.sp_cdc_enable_db;

EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_products', @role_name = NULL, @supports_net_changes = 0;

EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_customers', @role_name = NULL, @supports_net_changes = 0;

EXEC sys.sp_cdc_enable_table @source_schema = 'dbo', @source_name = 'modern_orders', @role_name = NULL, @supports_net_changes = 0;
