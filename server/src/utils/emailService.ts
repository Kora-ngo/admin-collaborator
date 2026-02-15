import transporter from '../config/email.js';

interface SendEmailOptions {
    to: string;
    subject: string;
    html: string;
    text?: string;
}

export const emailService = {
    /**
     * Send email (reusable method)
     */
    sendEmail: async (options: SendEmailOptions): Promise<boolean> => {
        try {
            const mailOptions = {
                from: `"Kora Platform" <${process.env.EMAIL_USER}>`,
                to: options.to,
                subject: options.subject,
                html: options.html,
                text: options.text || options.html.replace(/<[^>]*>/g, ''), // Strip HTML for text version
            };

            const info = await transporter.sendMail(mailOptions);
            console.log('✅ Email sent:', info.messageId);
            return true;
        } catch (error) {
            console.error('❌ Email send error:', error);
            return false;
        }
    },

    /**
     * Send feedback email to admin
     */
    sendFeedbackEmail: async (feedbackData: {
        userName: string;
        userEmail: string;
        role: string;
        organisation: string;
        message: string;
        replyEmail?: string;
    }): Promise<boolean> => {
        const { userName, userEmail, role, organisation, message, replyEmail } = feedbackData;

        const htmlContent = `
            <!DOCTYPE html>
            <html>
            <head>
                <style>
                    body {
                        font-family: Arial, sans-serif;
                        line-height: 1.6;
                        color: #333;
                    }
                    .container {
                        max-width: 600px;
                        margin: 0 auto;
                        padding: 20px;
                        background-color: #f9f9f9;
                    }
                    .header {
                        background-color: #4F46E5;
                        color: white;
                        padding: 20px;
                        text-align: center;
                        border-radius: 8px 8px 0 0;
                    }
                    .content {
                        background-color: white;
                        padding: 30px;
                        border-radius: 0 0 8px 8px;
                    }
                    .info-row {
                        display: flex;
                        margin-bottom: 15px;
                        border-bottom: 1px solid #eee;
                        padding-bottom: 10px;
                    }
                    .label {
                        font-weight: bold;
                        width: 150px;
                        color: #4F46E5;
                    }
                    .value {
                        flex: 1;
                        color: #333;
                    }
                    .message-section {
                        margin-top: 30px;
                        padding: 20px;
                        background-color: #f8f9fa;
                        border-left: 4px solid #4F46E5;
                        border-radius: 4px;
                    }
                    .message-title {
                        font-weight: bold;
                        color: #4F46E5;
                        margin-bottom: 10px;
                    }
                    .footer {
                        margin-top: 30px;
                        text-align: center;
                        color: #666;
                        font-size: 12px;
                    }
                </style>
            </head>
            <body>
                <div class="container">
                    <div class="header">
                        <h1 style="margin: 0;">🎯 Kora Feedback</h1>
                    </div>
                    
                    <div class="content">
                        <h2 style="color: #4F46E5; margin-top: 0;">New Feedback Received</h2>
                        
                        <div class="info-row">
                            <span class="label">👤 Name:</span>
                            <span class="value">${userName}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="label">📧 Email:</span>
                            <span class="value">${userEmail}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="label">🎭 Role:</span>
                            <span class="value">${role.charAt(0).toUpperCase() + role.slice(1)}</span>
                        </div>
                        
                        <div class="info-row">
                            <span class="label">🏢 Organisation:</span>
                            <span class="value">${organisation}</span>
                        </div>
                        
                        ${replyEmail && replyEmail !== userEmail ? `
                        <div class="info-row">
                            <span class="label">📬 Reply To:</span>
                            <span class="value">${replyEmail}</span>
                        </div>
                        ` : ''}
                        
                        <div class="message-section">
                            <div class="message-title">💬 Feedback Message:</div>
                            <p style="margin: 0; white-space: pre-wrap;">${message}</p>
                        </div>
                        
                        <div class="footer">
                            <p>This feedback was submitted via Kora Platform</p>
                            <p>Received at: ${new Date().toLocaleString('en-US', {
                                dateStyle: 'full',
                                timeStyle: 'long'
                            })}</p>
                        </div>
                    </div>
                </div>
            </body>
            </html>
        `;

        return await emailService.sendEmail({
            to: 'denzeltchaptche@gmail.com',
            subject: '🎯 Kora Feedback',
            html: htmlContent
        });
    }
};

export default emailService;