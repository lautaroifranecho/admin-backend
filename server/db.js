"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.supabase = void 0;
var supabase_js_1 = require("@supabase/supabase-js");
var config_1 = require("./config");
// Create Supabase client
var supabase = (0, supabase_js_1.createClient)(config_1.config.db.url, config_1.config.db.anonKey);
exports.supabase = supabase;
