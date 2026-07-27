import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Text,
  Button,
} from '@react-email/components';
import * as React from 'react';

interface TempasEmailProps {
  headline: string;
  htmlBody: string;
  ctaText?: string;
  ctaLink?: string;
  appUrl?: string;
}

export const TempasEmail = ({
  headline = "What's New in Tempas",
  htmlBody = "<p>Here are our latest updates.</p>",
  ctaText = "Go to Dashboard",
  ctaLink = "https://tempas.com",
  appUrl = "https://tempas.com",
}: TempasEmailProps) => {
  // Use the absolute URL so email clients can load it
  const logoUrl = `https://www.tempas.io/icon-512.png`;

  return (
    <Html>
      <Head />
      <Preview>{headline}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Img
              src={logoUrl}
              width="48"
              height="48"
              alt="Tempas Logo"
              style={logo}
            />
          </Section>
          
          <Heading style={h1}>{headline}</Heading>
          
          {/* Inject rich HTML from TipTap */}
          <Section style={bodySection}>
            <div dangerouslySetInnerHTML={{ __html: htmlBody }} style={richText} />
          </Section>

          {ctaText && ctaLink && (
            <Section style={btnContainer}>
              <Button style={button} href={ctaLink}>
                {ctaText}
              </Button>
            </Section>
          )}

          <Section style={footer}>
            <Text style={footerText}>
              Sent securely from Tempas.
            </Text>
            <Text style={footerLinks}>
              <Link href={`https://helpdesk.tempas.io/unsubscribe?email={{email}}`} style={link}>
                Unsubscribe
              </Link>
              {' • '}
              <Link href={appUrl} style={link}>
                Tempas Home
              </Link>
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default TempasEmail;

const main = {
  backgroundColor: '#f6f9fc',
  fontFamily: '-apple-system,BlinkMacSystemFont,"Segoe UI",Roboto,"Helvetica Neue",Ubuntu,sans-serif',
};

const container = {
  backgroundColor: '#ffffff',
  margin: '40px auto',
  padding: '40px 20px',
  borderRadius: '8px',
  boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
  maxWidth: '600px',
};

const header = {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  marginBottom: '24px',
};

const logo = {
  margin: '0 auto',
};

const h1 = {
  color: '#333',
  fontSize: '24px',
  fontWeight: '600',
  lineHeight: '1.25',
  textAlign: 'center' as const,
  marginBottom: '24px',
};

const bodySection = {
  marginBottom: '32px',
};

const richText = {
  color: '#444',
  fontSize: '16px',
  lineHeight: '1.5',
};

const btnContainer = {
  textAlign: 'center' as const,
  marginTop: '32px',
  marginBottom: '32px',
};

const button = {
  backgroundColor: '#D4A017', // warmGold
  borderRadius: '6px',
  color: '#fff',
  fontSize: '16px',
  textDecoration: 'none',
  textAlign: 'center' as const,
  display: 'inline-block',
  padding: '14px 24px',
  fontWeight: 'bold',
};

const footer = {
  borderTop: '1px solid #eaeaea',
  paddingTop: '24px',
  marginTop: '24px',
  textAlign: 'center' as const,
};

const footerText = {
  color: '#8898aa',
  fontSize: '12px',
  lineHeight: '16px',
};

const footerLinks = {
  color: '#8898aa',
  fontSize: '12px',
  marginTop: '8px',
};

const link = {
  color: '#8898aa',
  textDecoration: 'underline',
};
