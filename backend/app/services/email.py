"""
Vigil - Email Notification Service

Sends transactional emails for scan completion, critical findings,
daily digests, and compliance alerts via SendGrid.
"""

import os
from typing import List, Dict, Optional
from datetime import datetime, timezone

from sendgrid import SendGridAPIClient
from sendgrid.helpers.mail import Mail, Email, To, Content

from app.core.config import get_settings

settings = get_settings()
SENDGRID_API_KEY = settings.SENDGRID_API_KEY or os.environ.get('SENDGRID_API_KEY', '')
FROM_EMAIL = settings.FROM_EMAIL or 'alerts@example.com'
FROM_NAME = settings.FROM_NAME or 'Vigil Security'


class EmailService:
    """SendGrid-powered email notifications for Vigil platform."""

    def __init__(self):
        self.client = SendGridAPIClient(SENDGRID_API_KEY) if SENDGRID_API_KEY else None
        self.from_email = Email(FROM_EMAIL, FROM_NAME)

    def _send(self, to_email: str, subject: str, html_content: str, text_content: str = None) -> bool:
        """Send a single email via SendGrid."""
        if not self.client:
            print(f"[EMAIL] SendGrid not configured — logging to stdout")
            print(f"  To: {to_email} | Subject: {subject}")
            print(f"  Content: {html_content[:200]}...")
            return True

        message = Mail(
            from_email=self.from_email,
            to_emails=To(to_email),
            subject=subject,
            html_content=html_content,
            plain_text_content=text_content
        )

        try:
            response = self.client.send(message)
            return response.status_code in [200, 202]
        except Exception as e:
            print(f"[EMAIL ERROR] Failed to send to {to_email}: {e}")
            return False

    def send_scan_complete(self, to_email: str, org_name: str, scan_summary: Dict) -> bool:
        """Notify user that a scan has completed with summary."""
        subject = f"Vigil Scan Complete — {scan_summary.get('critical', 0)} Critical Findings in {org_name}"

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f172a;">Vigil Scan Complete</h2>
            <p>Your security scan for <strong>{org_name}</strong> has finished.</p>
            <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <div style="font-size: 32px; font-weight: 700; color: #ef4444;">{scan_summary.get('max_risk_score', 0)}/1000</div>
                <div style="color: #64748b;">Maximum Risk Score</div>
            </div>
            <table style="width: 100%; margin: 20px 0;">
                <tr>
                    <td style="padding: 10px; background: #fef2f2; color: #ef4444; font-weight: 600;">Critical: {scan_summary.get('critical', 0)}</td>
                    <td style="padding: 10px; background: #fff7ed; color: #f97316; font-weight: 600;">High: {scan_summary.get('high', 0)}</td>
                    <td style="padding: 10px; background: #fefce8; color: #eab308; font-weight: 600;">Medium: {scan_summary.get('medium', 0)}</td>
                </tr>
            </table>
            <p><a href="{scan_summary.get('dashboard_url', '#')}" style="background: #3b82f6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Dashboard</a></p>
            <p style="color: #94a3b8; font-size: 12px;">This is an automated alert from Vigil Continuous External Risk Surface.</p>
        </div>
        """
        return self._send(to_email, subject, html)

    def send_critical_finding(self, to_email: str, org_name: str, finding: Dict) -> bool:
        """Immediate alert for critical severity findings."""
        subject = f"CRITICAL: {finding.get('policy_name', 'Security Finding')} detected in {org_name}"

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #ef4444; color: #fff; padding: 16px; border-radius: 8px 8px 0 0;">
                <h2 style="margin: 0; font-size: 18px;">Critical Security Finding Detected</h2>
            </div>
            <div style="background: #fef2f2; padding: 20px; border: 1px solid #fecaca; border-top: none; border-radius: 0 0 8px 8px;">
                <h3 style="color: #7f1d1d; margin-top: 0;">{finding.get('policy_name')}</h3>
                <p style="color: #991b1b;">{finding.get('description', '')}</p>
                <table style="width: 100%; margin: 16px 0; font-size: 14px;">
                    <tr><td style="color: #64748b; padding: 4px 0;">Resource:</td><td style="color: #0f172a; font-weight: 600;">{finding.get('resource_arn', 'N/A')}</td></tr>
                    <tr><td style="color: #64748b; padding: 4px 0;">Region:</td><td style="color: #0f172a; font-weight: 600;">{finding.get('region', 'N/A')}</td></tr>
                    <tr><td style="color: #64748b; padding: 4px 0;">Est. Impact:</td><td style="color: #0f172a; font-weight: 600;">${finding.get('dollar_impact_low', 0):,} - ${finding.get('dollar_impact_high', 0):,}</td></tr>
                </table>
                <p><a href="{finding.get('remediation_url', '#')}" style="background: #ef4444; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Remediate Now</a></p>
            </div>
        </div>
        """
        return self._send(to_email, subject, html)

    def send_daily_digest(self, to_email: str, org_name: str, summary: Dict) -> bool:
        """Daily summary email with trend data."""
        subject = f"Vigil Daily Digest — {org_name} | {datetime.now(timezone.utc).strftime('%b %d, %Y')}"

        new_findings = summary.get('new_findings', [])
        auto_fixed = summary.get('auto_remediated', 0)
        risk_trend = summary.get('risk_trend', 'stable')
        trend_color = '#22c55e' if risk_trend == 'down' else '#ef4444' if risk_trend == 'up' else '#eab308'
        trend_text = 'Improving' if risk_trend == 'down' else 'Worsening' if risk_trend == 'up' else 'Stable'

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f172a;">Daily Security Digest</h2>
            <p style="color: #64748b;">{org_name} — {datetime.now(timezone.utc).strftime('%B %d, %Y')}</p>
            <div style="display: flex; gap: 16px; margin: 20px 0;">
                <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: {trend_color};">{trend_text}</div>
                    <div style="color: #64748b; font-size: 12px;">Risk Trend</div>
                </div>
                <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #3b82f6;">{len(new_findings)}</div>
                    <div style="color: #64748b; font-size: 12px;">New Findings</div>
                </div>
                <div style="flex: 1; background: #f8fafc; padding: 16px; border-radius: 8px; text-align: center;">
                    <div style="font-size: 24px; font-weight: 700; color: #22c55e;">{auto_fixed}</div>
                    <div style="color: #64748b; font-size: 12px;">Auto-Fixed</div>
                </div>
            </div>
            <p><a href="{summary.get('dashboard_url', '#')}" style="background: #3b82f6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">View Full Report</a></p>
        </div>
        """
        return self._send(to_email, subject, html)

    def send_trial_expiring(self, to_email: str, org_name: str, days_remaining: int) -> bool:
        """Warn user that trial is ending soon."""
        subject = f"Your Vigil trial for {org_name} expires in {days_remaining} days"

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f172a;">Trial Expiring Soon</h2>
            <p>Your Vigil assessment for <strong>{org_name}</strong> expires in <strong>{days_remaining} days</strong>.</p>
            <div style="background: #fff7ed; border: 1px solid #fed7aa; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="color: #c2410c; margin-top: 0;">What you will lose:</h3>
                <ul style="color: #7c2d12;">
                    <li>Continuous security monitoring</li>
                    <li>Automatic misconfiguration fixes</li>
                    <li>Compliance drift alerts</li>
                    <li>Historical scan data (deleted after 30 days)</li>
                </ul>
            </div>
            <p><a href="#" style="background: #f59e0b; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block; font-weight: 600;">Upgrade Now</a></p>
            <p style="color: #94a3b8; font-size: 12px;">Questions? Open an issue on GitHub.</p>
        </div>
        """
        return self._send(to_email, subject, html)

    def send_board_report(self, to_email: str, org_name: str, report_data: Dict) -> bool:
        """Monthly/quarterly executive summary for leadership."""
        subject = f"Vigil Board Report — {org_name} | {datetime.now(timezone.utc).strftime('%B %Y')}"

        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 700px; margin: 0 auto;">
            <div style="border-bottom: 3px solid #3b82f6; padding-bottom: 16px; margin-bottom: 24px;">
                <h1 style="color: #0f172a; margin: 0;">Cloud Security Posture Report</h1>
                <p style="color: #64748b; margin: 8px 0 0;">{org_name} | {datetime.now(timezone.utc).strftime('%B %Y')}</p>
            </div>
            <div style="display: flex; gap: 20px; margin-bottom: 24px;">
                <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 36px; font-weight: 700; color: #3b82f6;">{report_data.get('avg_risk_score', 0)}</div>
                    <div style="color: #64748b;">Avg Risk Score</div>
                </div>
                <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 36px; font-weight: 700; color: #22c55e;">{report_data.get('compliance_pct', 0)}%</div>
                    <div style="color: #64748b;">Compliance Ready</div>
                </div>
                <div style="flex: 1; background: #f8fafc; padding: 20px; border-radius: 8px;">
                    <div style="font-size: 36px; font-weight: 700; color: #ef4444;">{report_data.get('critical_open', 0)}</div>
                    <div style="color: #64748b;">Critical Open</div>
                </div>
            </div>
            <h3 style="color: #0f172a;">Compliance Framework Status</h3>
            <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
                <tr style="background: #f1f5f9;">
                    <th style="text-align: left; padding: 10px;">Framework</th>
                    <th style="text-align: center; padding: 10px;">Passing</th>
                    <th style="text-align: center; padding: 10px;">Failing</th>
                </tr>
        """
        for fw in report_data.get('frameworks', []):
            html += f"""
                <tr style="border-bottom: 1px solid #e2e8f0;">
                    <td style="padding: 10px;">{fw['name']}</td>
                    <td style="text-align: center; padding: 10px; color: #22c55e; font-weight: 600;">{fw['passing']}</td>
                    <td style="text-align: center; padding: 10px; color: #ef4444; font-weight: 600;">{fw['failing']}</td>
                </tr>
            """
        html += """
            </table>
            <p style="color: #94a3b8; font-size: 12px; margin-top: 32px;">
                This report was automatically generated by Vigil Continuous External Risk Surface.
                For questions, open an issue on GitHub.
            </p>
        </div>
        """
        return self._send(to_email, subject, html)

    def send_welcome(self, to_email: str, first_name: str) -> bool:
        """Welcome email after registration."""
        subject = "Welcome to Vigil — Your cloud security journey starts now"
        html = f"""
        <div style="font-family: -apple-system, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #0f172a;">Welcome to Vigil, {first_name}!</h2>
            <p>You are now set up to continuously monitor your AWS environment for misconfigurations, compliance gaps, and active attack patterns.</p>
            <h3 style="color: #0f172a;">Next steps:</h3>
            <ol style="color: #334155; line-height: 2;">
                <li><strong>Connect your AWS account</strong> (takes 3 minutes)</li>
                <li><strong>Run your first scan</strong> (results in 5 minutes)</li>
                <li><strong>Review findings</strong> and auto-remediate with one click</li>
            </ol>
            <p><a href="#" style="background: #3b82f6; color: #fff; padding: 12px 24px; text-decoration: none; border-radius: 6px; display: inline-block;">Start Onboarding</a></p>
            <p style="color: #94a3b8; font-size: 12px;">Need help? Open an issue on GitHub.</p>
        </div>
        """
        return self._send(to_email, subject, html)
