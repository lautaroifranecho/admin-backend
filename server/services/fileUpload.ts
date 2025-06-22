import fs from 'fs';
import { parse } from 'csv-parse';
import * as XLSX from 'xlsx';
import { InsertUser } from '@shared/schema';

interface CSVUser {
  first_name: string;
  last_name: string;
  email: string;
  address: string;
  client_number: string;
  phone_number: string;
  alt_number?: string;
  group_template?: string;
}

export async function processCSVFile(filePath: string, originalName: string): Promise<InsertUser[]> {
  const fileExtension = originalName.toLowerCase().substring(originalName.lastIndexOf('.'));
  
  if (fileExtension === '.csv') {
    return await processCSV(filePath);
  } else if (fileExtension === '.xlsx' || fileExtension === '.xls') {
    return await processExcel(filePath);
  } else {
    throw new Error('Unsupported file format. Please use CSV or Excel files.');
  }
}

async function processCSV(filePath: string): Promise<InsertUser[]> {
  const users: InsertUser[] = [];
  
  return new Promise((resolve, reject) => {
    fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,
        skip_empty_lines: true,
        trim: true
      }))
      .on('data', (row) => {
        // Map CSV row to InsertUser schema
        users.push({
          client_number: row.client_number || '',
          first_name: row.first_name || '',
          last_name: row.last_name || '',
          phone_number: row.phone_number || '',
          alt_number: row.alt_number || null,
          address: row.address || '',
          email: row.email || '',
          group_template: row.group_template || null,
          verification_token: '', // Will be generated later
          token_expiry: new Date().toISOString(), // Will be generated later
        });
      })
      .on('end', () => {
        resolve(users);
      })
      .on('error', (error) => {
        reject(error);
      });
  });
}

async function processExcel(filePath: string): Promise<InsertUser[]> {
  const workbook = XLSX.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const worksheet = workbook.Sheets[sheetName];
  const data = XLSX.utils.sheet_to_json(worksheet);
  
  const users: InsertUser[] = [];
  
  for (const row of data as any[]) {
    const user = {
      first_name: row.first_name || row.FirstName || row.FIRST_NAME || '',
      last_name: row.last_name || row.LastName || row.LAST_NAME || '',
      email: row.email || row.Email || row.EMAIL || '',
      address: row.address || row.Address || row.ADDRESS || '',
      client_number: row.clientnumber || row.client_number || row.ClientNumber || row.CLIENT_NUMBER || '',
      phone_number: row.phonenumber || row.phone_number || row.PhoneNumber || row.PHONE_NUMBER || '',
      alt_number: row.altnumber || row.alt_number || row.AltNumber || row.ALT_NUMBER || undefined,
      group_template: row.group_template || row.GroupTemplate || row.GROUP_TEMPLATE || row.grouptemplate || undefined
    };
    
    users.push({
      client_number: user.client_number || '',
      first_name: user.first_name,
      last_name: user.last_name,
      phone_number: user.phone_number || '',
      alt_number: user.alt_number || null,
      address: user.address || '',
      email: user.email || '',
      group_template: user.group_template || null,
      verification_token: '', 
      token_expiry: new Date().toISOString(), 
    });
  }
  
  return users;
}
