import { Resend } from 'resend'
import { env } from '../config/env'

const resend = new Resend(env.RESEND_API_KEY)

// Domain hermionehair.com is verified on Resend — emails can be sent to any address.
const FROM_ADDRESS = 'Hermione Hair <no-reply@hermionehair.com>'

interface OrderItemInfo {
  name: string
  quantity: number
  priceAtPurchase: number
}

export const emailService = {
  sendCustomEmail: async (email: string, subject: string, message: string, adminName = 'Hermione Hair Team') => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#F8F4EE; border:1px solid #e8e2d9; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2E4A3F; padding:24px 32px; text-align:center;">
                    <h1 style="color:#F8F4EE; font-family: Georgia, serif; font-style:italic; margin:0; font-size:24px;">Hermione Hair</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <p style="color:#444; line-height:1.6; margin:0 0 16px;">Hello,</p>
                    <p style="color:#444; line-height:1.6; white-space:pre-line; margin:0 0 24px;">${message}</p>
                    <p style="color:#444; line-height:1.6; margin:0;">Best regards,<br />${adminName}</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#e8e2d9; padding:16px 32px; text-align:center;">
                    <p style="color:#666; font-size:12px; margin:0;">This email was sent by the Hermione Hair admin team.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject,
        html: htmlContent,
      })
      if (error) {
        console.error('Failed to send custom email (Resend API Error):', error)
      } else {
        console.log(`Custom email sent successfully to ${email}:`, data)
      }
    } catch (err) {
      console.error('Failed to send custom email (Network/Exception):', err)
    }
  },

  sendVerificationEmail: async (email: string, name: string, token: string) => {
    const verificationUrl = `${env.FRONTEND_URL}/verify-email?token=${token}&email=${encodeURIComponent(email)}`
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#F8F4EE; border:1px solid #e8e2d9; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2E4A3F; padding:24px 32px; text-align:center;">
                    <h1 style="color:#F8F4EE; font-family: Georgia, serif; font-style:italic; margin:0; font-size:24px;">Hermione Hair 🌿</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="color:#2E4A3F; font-family:Georgia, serif; font-style:italic; margin:0 0 16px;">Verify Your Email Address</h2>
                    <p style="color:#444; line-height:1.6; margin:0 0 16px;">Hello ${name},</p>
                    <p style="color:#444; line-height:1.6; margin:0 0 24px;">Thank you for registering with Hermione Hair. Please enter the 6-digit verification code below to complete your account setup:</p>
                    <div style="text-align:center; margin:24px 0;">
                      <div style="display:inline-block; font-family:monospace; font-size:32px; font-weight:bold; color:#2E4A3F; letter-spacing:8px; padding:16px 32px; border:2px dashed #2E4A3F; background:white; border-radius:8px;">
                        ${token}
                      </div>
                    </div>
                    <p style="color:#444; line-height:1.6; margin:0 0 16px; text-align:center;">This code expires in 24 hours.</p>
                    <p style="color:#444; line-height:1.6; margin:24px 0 16px;">Or click the button below to verify automatically:</p>
                    <div style="text-align:center; margin:24px 0;">
                      <a href="${verificationUrl}" style="background:#2E4A3F; color:white; padding:14px 28px; text-decoration:none; border-radius:25px; font-weight:bold; display:inline-block; font-size:16px;">Verify Email Address</a>
                    </div>
                  </td>
                </tr>
                <tr>
                  <td style="background:#e8e2d9; padding:16px 32px; text-align:center;">
                    <p style="color:#666; font-size:12px; margin:0 0 8px;">If you did not create an account with Hermione Hair, please ignore this email.</p>
                    <p style="color:#666; font-size:12px; margin:0;">© ${new Date().getFullYear()} Hermione Hair. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: 'Your Hermione Hair Verification Code 🌿',
        html: htmlContent,
      })
      if (error) {
        console.error('Failed to send verification email (Resend API Error):', error)
      } else {
        console.log(`Verification email sent successfully to ${email}:`, data)
      }
    } catch (err) {
      console.error('Failed to send verification email (Network/Exception):', err)
    }
  },

  sendPasswordResetEmail: async (email: string, name: string, token: string) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#F8F4EE; border:1px solid #e8e2d9; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2E4A3F; padding:24px 32px; text-align:center;">
                    <h1 style="color:#F8F4EE; font-family: Georgia, serif; font-style:italic; margin:0; font-size:24px;">Hermione Hair 🌿</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="color:#2E4A3F; font-family:Georgia, serif; font-style:italic; margin:0 0 16px;">Password Reset Request</h2>
                    <p style="color:#444; line-height:1.6; margin:0 0 16px;">Hello ${name},</p>
                    <p style="color:#444; line-height:1.6; margin:0 0 24px;">We received a request to reset your password. Enter the 6-digit code below on the reset page:</p>
                    <div style="text-align:center; margin:24px 0;">
                      <div style="display:inline-block; font-family:monospace; font-size:32px; font-weight:bold; color:#2E4A3F; letter-spacing:8px; padding:16px 32px; border:2px dashed #2E4A3F; background:white; border-radius:8px;">
                        ${token}
                      </div>
                    </div>
                    <p style="color:#444; line-height:1.6; margin:0 0 16px; text-align:center;">This code expires in 24 hours.</p>
                    <p style="color:#666; line-height:1.6; margin:24px 0 0; font-size:14px;">If you did not request a password reset, please ignore this email. Your password will not change.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#e8e2d9; padding:16px 32px; text-align:center;">
                    <p style="color:#666; font-size:12px; margin:0 0 8px;">This is an automated message from Hermione Hair.</p>
                    <p style="color:#666; font-size:12px; margin:0;">© ${new Date().getFullYear()} Hermione Hair. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `
    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: 'Reset Your Hermione Hair Password',
        html: htmlContent,
      })
      if (error) {
        console.error('Failed to send password reset email (Resend API Error):', error)
      } else {
        console.log(`Password reset email sent successfully to ${email}:`, data)
      }
    } catch (err) {
      console.error('Failed to send password reset email (Network/Exception):', err)
    }
  },

  sendOrderConfirmation: async (
    email: string,
    orderId: string,
    items: OrderItemInfo[],
    totalAmount: number,
    address: any
  ) => {
    const formattedTotal = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(totalAmount)

    const itemsListHtml = items
      .map(
        (item) => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #e8e2d9;">${item.name} x ${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e8e2d9; text-align: right;">
          ${new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN',
            maximumFractionDigits: 0,
          }).format(item.priceAtPurchase * item.quantity)}
        </td>
      </tr>
    `
      )
      .join('')

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#F8F4EE; border:1px solid #e8e2d9; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2E4A3F; padding:24px 32px; text-align:center;">
                    <h1 style="color:#F8F4EE; font-family: Georgia, serif; font-style:italic; margin:0; font-size:24px;">Hermione Hair 🌿</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="color:#2E4A3F; font-family:Georgia, serif; font-style:italic; margin:0 0 16px;">Order Confirmed! 🎉</h2>
                    <p style="color:#444; line-height:1.6; margin:0 0 16px;">Thank you for shopping with us! We have received your payment and are preparing your order.</p>
                    <p style="color:#444; margin:0 0 24px;"><strong>Order ID:</strong> <span style="font-family:monospace;">${orderId}</span></p>
                    <table style="width:100%; border-collapse:collapse; margin:20px 0;">
                      <thead>
                        <tr style="background:#e8e2d9; color:#2E4A3F;">
                          <th style="padding:10px; text-align:left;">Item</th>
                          <th style="padding:10px; text-align:right;">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        ${itemsListHtml}
                        <tr style="font-weight:bold; color:#2E4A3F;">
                          <td style="padding:10px; border-top:2px solid #2E4A3F;">Total Paid</td>
                          <td style="padding:10px; border-top:2px solid #2E4A3F; text-align:right;">${formattedTotal}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div style="background:#e8e2d9; padding:16px; border-radius:6px; margin:20px 0;">
                      <h4 style="color:#2E4A3F; margin:0 0 10px;">Delivery Information</h4>
                      <p style="margin:0; color:#444; font-size:14px; line-height:1.6;">
                        ${address.street || ''}<br />
                        ${address.city || ''}, ${address.state || ''}<br />
                        Phone: ${address.phone || ''}
                      </p>
                    </div>
                    <p style="color:#444; line-height:1.6;">We'll send you another email with your logistics tracking number once your order has shipped.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#e8e2d9; padding:16px 32px; text-align:center;">
                    <p style="color:#666; font-size:12px; margin:0;">© ${new Date().getFullYear()} Hermione Hair. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: 'Your Hermione Hair Order is Confirmed! 🌿',
        html: htmlContent,
      })
      if (error) {
        console.error('Failed to send order confirmation email (Resend API Error):', error)
      } else {
        console.log(`Order confirmation email sent to ${email}:`, data)
      }
    } catch (err) {
      console.error('Failed to send order confirmation email (Network/Exception):', err)
    }
  },

  sendTrackingNotification: async (
    email: string,
    orderId: string,
    trackingNumber: string,
    logisticsCompany: string
  ) => {
    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0"></head>
      <body style="margin:0; padding:0; background-color:#f4f4f4; font-family: Arial, sans-serif;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
          <tr>
            <td align="center" style="padding: 20px;">
              <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px; width:100%; background:#F8F4EE; border:1px solid #e8e2d9; border-radius:8px; overflow:hidden;">
                <tr>
                  <td style="background:#2E4A3F; padding:24px 32px; text-align:center;">
                    <h1 style="color:#F8F4EE; font-family: Georgia, serif; font-style:italic; margin:0; font-size:24px;">Hermione Hair 🌿</h1>
                  </td>
                </tr>
                <tr>
                  <td style="padding:32px;">
                    <h2 style="color:#2E4A3F; font-family:Georgia, serif; font-style:italic; margin:0 0 16px;">Your Order is On Its Way! 📦</h2>
                    <p style="color:#444; line-height:1.6; margin:0 0 16px;">Great news! Your package has been dispatched and is currently in transit.</p>
                    <p style="color:#444; margin:0 0 24px;"><strong>Order ID:</strong> <span style="font-family:monospace;">${orderId}</span></p>
                    <div style="background:#e8e2d9; padding:24px; border-radius:8px; text-align:center; margin:24px 0;">
                      <p style="margin:0 0 8px; color:#555; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Logistics Provider</p>
                      <h3 style="margin:0 0 16px; color:#2E4A3F;">${logisticsCompany}</h3>
                      <p style="margin:0 0 8px; color:#555; text-transform:uppercase; font-size:12px; letter-spacing:1px;">Tracking Number</p>
                      <div style="font-family:monospace; font-size:24px; font-weight:bold; color:#2E4A3F; letter-spacing:2px; padding:12px; border:1px dashed #2E4A3F; display:inline-block; background:white; border-radius:4px;">
                        ${trackingNumber}
                      </div>
                    </div>
                    <p style="color:#444; line-height:1.6;">Visit the official website of <strong>${logisticsCompany}</strong> and enter your tracking number to monitor your delivery status.</p>
                  </td>
                </tr>
                <tr>
                  <td style="background:#e8e2d9; padding:16px 32px; text-align:center;">
                    <p style="color:#666; font-size:12px; margin:0 0 8px;">Thank you for choosing Hermione Hair!</p>
                    <p style="color:#666; font-size:12px; margin:0;">© ${new Date().getFullYear()} Hermione Hair. All rights reserved.</p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
      </html>
    `

    try {
      const { data, error } = await resend.emails.send({
        from: FROM_ADDRESS,
        to: email,
        subject: 'Your Hermione Hair Order is On Its Way! 📦',
        html: htmlContent,
      })
      if (error) {
        console.error('Failed to send tracking notification email (Resend API Error):', error)
      } else {
        console.log(`Tracking notification email sent to ${email}:`, data)
      }
    } catch (err) {
      console.error('Failed to send tracking notification email (Network/Exception):', err)
    }
  },
}




