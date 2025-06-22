import * as XLSX from 'xlsx';
import { User } from '@shared/schema';

const fields = [
  'client_number',
  'first_name',
  'last_name',
  'email',
  'phone_number',
  'alt_number',
  'address',
  'group_template'
];

const fieldHeaders = [
  'Client Number',
  'First Name',
  'Last Name',
  'Email',
  'Phone Number',
  'Alt Number',
  'Address',
  'Group Template'
];

function mapUsersToData(users: User[]) {
  return users.map(user => {
    const row: any = {};
    fields.forEach((field, index) => {
        row[fieldHeaders[index]] = (user as any)[field] ?? '';
    });
    return row;
  });
}

export function exportToCSV(users: User[]): string {
    const data = mapUsersToData(users);
    const worksheet = XLSX.utils.json_to_sheet(data, { header: fieldHeaders });
    return XLSX.utils.sheet_to_csv(worksheet);
}

export function exportToXLSX(users: User[]): Buffer {
    const data = mapUsersToData(users);
    const worksheet = XLSX.utils.json_to_sheet(data, { header: fieldHeaders });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Users');

    const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
    return buffer;
} 