export const templateAHtml = (name: string, verificationUrl: string, ADMIN_EMAIL: string, COMPANY_NAME: string, address?: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Confirm your Address – Returning Your Original Estate Documents</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 30px 0 20px 0;">
              <img src="https://norris-legal.com/wp-content/uploads/2022/01/Norris-legal3.png" alt="Company Logo" style="max-width: 180px; height: auto;"/>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 30px;">
              <!-- Greeting -->
              <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>
              
              <!-- Message -->
              <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
                We hope you’ve been doing well. As part of our ongoing efforts to organize and optimize our file room, we are reviewing client records and returning original estate planning documents that are no longer actively managed through our office.<br>
                We are currently preparing to mail your original documents of your estate planning back to you for safekeeping.<br>
                Please confirm if the following is still your current address.
              </p>
              
              ${address ? `
              <!-- Address Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #111827;">Current Address:</p>
                    <p style="margin: 0; color: #374151;">${address}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; 
                              background-color: #1976D2; 
                              color: #ffffff; 
                              text-decoration: none;
                              padding: 15px 30px;
                              border-radius: 6px;
                              font-weight: bold;
                              font-size: 16px;">
                      Verify My Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td style="padding: 20px 0; color: #6b7280; font-size: 14px;">
                    <p style="margin: 0 0 10px 0;">
                    Once confirmed, we will securely package and ship your originals to you. <br>
                    Thank you for your time, and we appreciate the opportunity to have served you in the past.<br><br>

                    Best regards,<br>
                    Patrick Norris
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


export const templateBHtml = (name: string, verificationUrl: string, ADMIN_EMAIL: string, COMPANY_NAME: string, address?: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title</title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 30px 0 20px 0;">
              <img src="https://norris-legal.com/wp-content/uploads/2022/01/Norris-legal3.png" alt="Company Logo" style="max-width: 180px; height: auto;"/>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 30px;">
              <!-- Greeting -->
              <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>
              
              <!-- Message -->
              <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
              I hope this message finds you well!  I just wanted to take a moment to sincerely thank you for your trust and opportunities. As part of our ongoing commitment, we're excited to share some upcoming developments with you.<br>
              As part of our responsibility in securely storing your original estate planning documents, we want to ensure our records are accurate. 
              </p>
              
              ${address ? `
              <!-- Address Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #111827;">Current Address:</p>
                    <p style="margin: 0; color: #374151;">${address}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; 
                              background-color: #1976D2; 
                              color: #ffffff; 
                              text-decoration: none;
                              padding: 15px 30px;
                              border-radius: 6px;
                              font-weight: bold;
                              font-size: 16px;">
                      Verify My Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-top: 30px;">
                <tr>
                  <td style="padding: 20px 0; color: #6b7280; font-size: 14px;">
                    <p style="margin: 0 0 10px 0;">
                     Each year moving forward, we will send an automated email like this to help ensure your information stays up to date. If you have moved or plan to relocate to another state, just let us know so we can update your file and support you with any necessary planning adjustments. <br><br>
                    
                      <strong>Exciting News:</strong><br>
                      We are thrilled to announce our new podcast, where we will be highlighting stories of business owners, entrepreneurs, and community leaders. If you are interested in sharing your story, we love to hear from you. <br>
                      You can learn more and reach out to us via our new website & LinkedIn page:<br>
                      [insert website link]<br>
                      [insert podcast link]<br>
                      [insert linkedin link]<br>
                      We truly value the opportunities and look forward to staying connected. Once again, please reply to this email to confirm or update your address. Thank you!<br><br>

                      Best regards,<br>
                      Patrick Norris
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


export const templateCHtml = (name: string, verificationUrl: string, ADMIN_EMAIL: string, COMPANY_NAME: string, address?: string) => `
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title></title>
</head>
<body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f3f4f6;">
  <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f3f4f6;">
    <tr>
      <td align="center" style="padding: 20px 0;">
        <table border="0" cellpadding="0" cellspacing="0" width="600" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
          <!-- Logo -->
          <tr>
            <td align="center" style="padding: 30px 0 20px 0;">
              <img src="https://norris-legal.com/wp-content/uploads/2022/01/Norris-legal3.png" alt="Company Logo" style="max-width: 180px; height: auto;"/>
            </td>
          </tr>
          
          <!-- Content -->
          <tr>
            <td style="padding: 0 30px;">
              <!-- Greeting -->
              <p style="font-size: 18px; color: #1f2937; margin-bottom: 20px;">
                Hi <strong>${name}</strong>,
              </p>
              
              <!-- Message -->
              <p style="color: #4b5563; margin-bottom: 20px; line-height: 1.6;">
                I hope you are doing well. As part of our responsibilities in securely holding your original estate planning documents, we are reaching out to verify your current home address. <br>
                We will begin using automated annual emails yearly to help ensure your address stays up to date in our records. Please take a moment to confirm your address we have on file is still current.<br>
              </p>
              
              ${address ? `
              <!-- Address Box -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #f9fafb; border-radius: 8px; margin: 20px 0;">
                <tr>
                  <td style="padding: 20px;">
                    <p style="margin: 0 0 10px 0; font-weight: 600; color: #111827;">Current Address:</p>
                    <p style="margin: 0; color: #374151;">${address}</p>
                  </td>
                </tr>
              </table>
              ` : ''}
              
              <!-- CTA Button -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="margin: 30px 0;">
                <tr>
                  <td align="center">
                    <a href="${verificationUrl}" 
                       style="display: inline-block; 
                              background-color: #1976D2; 
                              color: #ffffff; 
                              text-decoration: none;
                              padding: 15px 30px;
                              border-radius: 6px;
                              font-weight: bold;
                              font-size: 16px;">
                      Verify My Address
                    </a>
                  </td>
                </tr>
              </table>
              
              <!-- Footer -->
              <table border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1px solid #e5e7eb; margin-top: 30px;">
                <tr>
                  <td style="padding: 20px 0; color: #6b7280; font-size: 14px;">
                    <p style="margin: 0 0 10px 0;">
                     If your address has changed or you plan to relocate to another state, please let us know as soon as possible so we can update your file and discuss what we may need to do with your estate planning documents. <br>
                    We appreciate the opportunity to work with you and would love to stay in touch for any future needs you might have. <br><br>
                    Best regards,<br>
                    Patrick Norris
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;


export const templateAText = (name: string, verificationUrl: string, ADMIN_EMAIL: string, COMPANY_NAME: string, address?: string) => `
Hi ${name},

We hope you’ve been doing well. As part of our ongoing efforts to organize and optimize our file room, we are reviewing client records and returning original estate planning documents that are no longer actively managed through our office. 
We are currently preparing to mail your original documents of your estate planning back to you for safekeeping.

${`Please confirm if the following is still your current address: ${address}`}

Please click the following link to verify your address:
${verificationUrl}

Once confirmed, we will securely package and ship your originals to you. 
Thank you for your time, and we appreciate the opportunity to have served you in the past. 

Best regards,
Patrick Norris
`;
export const templateBText = (name: string, verificationUrl: string, ADMIN_EMAIL: string, COMPANY_NAME: string, address?: string) => `
Hi ${name},

I hope this message finds you well!  I just wanted to take a moment to sincerely thank you for your trust and opportunities. As part of our ongoing commitment, we're excited to share some upcoming developments with you.
As part of our responsibility in securely storing your original estate planning documents, we want to ensure our records are accurate. 


${`Current Address: ${address}`}

Please click the following link to confirm your address:
${verificationUrl}

Each year moving forward, we will send an automated email like this to help ensure your information stays up to date. If you have moved or plan to relocate to another state, just let us know so we can update your file and support you with any necessary planning adjustments. 

Exciting News:
We are thrilled to announce our new podcast, where we will be highlighting stories of business owners, entrepreneurs, and community leaders. If you are interested in sharing your story, we love to hear from you. 
You can learn more and reach out to us via our new website & LinkedIn page:
[insert website link]
[insert podcast link]
[insert linkedin link]
We truly value the opportunities and look forward to staying connected. Once again, please confirm or update your address. Thank you!

Best regards,
Patrick Norris 
`;
export const templateCText = (name: string, verificationUrl: string, ADMIN_EMAIL: string, COMPANY_NAME: string, address?: string) => `
Hi ${name},

Body:
I hope you are doing well. As part of our responsibilities in securely holding your original estate planning documents, we are reaching out to verify your current home address. 
We will begin using automated annual emails yearly to help ensure your address stays up to date in our records. Please take a moment to confirm your address we have on file is still current:

${address}

Please click the following link to confirm your address:
${verificationUrl}

If your address has changed or you plan to relocate to another state, please let us know as soon as possible so we can update your file and discuss what we may need to do with your estate planning documents. 
We appreciate the opportunity to work with you and would love to stay in touch for any future needs you might have. 

Best regards,
Patrick Norris
`;


