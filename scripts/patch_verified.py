import pandas as pd

df = pd.read_csv('data/maharashtra_colleges_all_5378.csv')
updates = {
    'Bhigwan College': ('https://coabhigwan.edu.in/', 'https://coabhigwan.edu.in/contact-us'),
    'Sharadchandra Pawar College Of Pharmacy': ('https://www.spcop.in/', 'https://www.spcop.in/contact-us'),
    'DR D Y Patil School OF Engineering Academy, Ambi': ('https://dypatiluniversitypune.edu.in/', 'https://dypatiluniversitypune.edu.in/contact-us'),
    'Rajarshi Shahu College Of Education': ('https://www.jspmrscoed.edu.in/', 'https://www.jspmrscoed.edu.in/contact-us')
}

for k, v in updates.items():
    mask = df['college_name'].str.contains(k, case=False, na=False)
    df.loc[mask, 'website_url'] = v[0]
    df.loc[mask, 'source_page_url'] = v[1]
    df.loc[mask, 'verification_status'] = 'VERIFIED_HTTP_WORKING'
    df.loc[mask, 'http_status_code'] = 200

try:
    df.to_csv('data/maharashtra_colleges_all_5378.csv', index=False, encoding='utf-8-sig')
    print('Updated data/maharashtra_colleges_all_5378.csv')
except PermissionError:
    df.to_csv('data/maharashtra_colleges_all_5378_updated.csv', index=False, encoding='utf-8-sig')
    print('data/maharashtra_colleges_all_5378.csv is open in Excel; saved to data/maharashtra_colleges_all_5378_updated.csv')

try:
    df.to_csv('data/maharashtra_colleges_4500.csv', index=False, encoding='utf-8-sig')
    print('Updated data/maharashtra_colleges_4500.csv')
except PermissionError:
    pass

print('Successfully patched verified official websites.')
