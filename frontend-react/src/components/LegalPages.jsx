import React from 'react';
import { useI18n } from '../context/LanguageContext';
import { ShieldCheck, Scale, ArrowLeft } from 'lucide-react';

export const PrivacyPage = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="legal-container">
      <div className="legal-card">
        <button onClick={() => onNavigate('landing')} className="btn-back-legal">
          <ArrowLeft size={16} />
          <span>{t('converter.backButton')}</span>
        </button>

        <div className="legal-header">
          <ShieldCheck size={40} className="legal-icon" />
          <h1>{t('privacy.title')}</h1>
        </div>

        <div className="legal-content">
          <h2>{t('privacy.section.information.title')}</h2>
          <ul>
            <li>{t('privacy.section.information.item1')}</li>
            <li>{t('privacy.section.information.item2')}</li>
            <li>{t('privacy.section.information.item3')}</li>
            <li>{t('privacy.section.information.item4')}</li>
          </ul>

          <h2>{t('privacy.section.usage.title')}</h2>
          <ul>
            <li>{t('privacy.section.usage.item1')}</li>
            <li>{t('privacy.section.usage.item2')}</li>
            <li>{t('privacy.section.usage.item3')}</li>
            <li>{t('privacy.section.usage.item4')}</li>
          </ul>

          <h2>{t('privacy.section.storage.title')}</h2>
          <p>{t('privacy.section.storage.text')}</p>

          <h2>{t('privacy.section.third_party.title')}</h2>
          <p>{t('privacy.section.third_party.text')}</p>

          <h2>{t('privacy.section.rights.title')}</h2>
          <p>{t('privacy.section.rights.text')}</p>

          <h2>{t('privacy.section.contact.title')}</h2>
          <p>
            Discord:{' '}
            <a href="https://discord.gg/mMPMyPGq6W" target="_blank" rel="noopener noreferrer">
              Join our server
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export const TermsPage = ({ onNavigate }) => {
  const { t } = useI18n();

  return (
    <div className="legal-container">
      <div className="legal-card">
        <button onClick={() => onNavigate('landing')} className="btn-back-legal">
          <ArrowLeft size={16} />
          <span>{t('converter.backButton')}</span>
        </button>

        <div className="legal-header">
          <Scale size={40} className="legal-icon" />
          <h1>{t('terms.title')}</h1>
        </div>

        <div className="legal-content">
          <h2>{t('terms.section.acceptance.title')}</h2>
          <p>{t('terms.section.acceptance.text')}</p>

          <h2>{t('terms.section.description.title')}</h2>
          <ul>
            <li>{t('terms.section.description.item1')}</li>
            <li>{t('terms.section.description.item2')}</li>
            <li>{t('terms.section.description.item3')}</li>
          </ul>

          <h2>{t('terms.section.responsibilities.title')}</h2>
          <ul>
            <li>{t('terms.section.responsibilities.item1')}</li>
            <li>{t('terms.section.responsibilities.item2')}</li>
            <li>{t('terms.section.responsibilities.item3')}</li>
          </ul>

          <h2>{t('terms.section.payments.title')}</h2>
          <p>{t('terms.section.payments.text')}</p>

          <h2>{t('terms.section.availability.title')}</h2>
          <p>{t('terms.section.availability.text')}</p>

          <h2>{t('terms.section.termination.title')}</h2>
          <p>{t('terms.section.termination.text')}</p>

          <h2>{t('terms.section.contact.title')}</h2>
          <p>
            Discord:{' '}
            <a href="https://discord.gg/mMPMyPGq6W" target="_blank" rel="noopener noreferrer">
              Join our server
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};
