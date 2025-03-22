import React, { useMemo } from 'react';
import {
  formatDatetime,
  parseDate,
  useConfig,
  ExtensionSlot,
  type Diagnosis,
  type Visit,
  PatientUuid,
  formatTime,
} from '@openmrs/esm-framework';

import { useTranslation } from 'react-i18next';
import classNames from 'classnames';
import { Tag, Tab, Tabs, TabList, TabPanel, TabPanels } from '@carbon/react';
import NotesSummary from './past-visits-components/notes-summary.component';
import styles from './past-visits-components/visit-summary.scss';
import { type Note } from './visit.resource';

interface DiagnosisItem {
  diagnosis: string;
  rank: number;
  type: string;
  voided?: boolean;
}

interface VisitNote {
  uuid: string;
  value: string;
  obsDatetime: string;
  concept: {
    uuid: string;
    display: string;
    links: any[];
  };
}

export interface PageResult {
  visit: Visit;
  diagnoses: Diagnosis[];
  visitNotes: VisitNote[];
}

interface VisitDataProps {
  Diagnosis: Diagnosis[];
  visitNote: VisitNote[];
}

const DisplayVisitData = ({ Diagnosis, visitNote }: VisitDataProps) => {
  const { t } = useTranslation();
  const config = useConfig();

  const handleTabClick = (tabId: string) => {};

  const [diagnoses, notes] = useMemo(() => {
    const diagnoses: Array<DiagnosisItem> = [];
    const notes: Array<Note> = [];

    // Process Diagnoses
    if (Diagnosis && Array.isArray(Diagnosis)) {
      const validDiagnoses = Diagnosis.filter((diagnosis) => !diagnosis.voided).map((diagnosis) => ({
        diagnosis: diagnosis.display,
        type: diagnosis.rank === 1 ? 'red' : 'blue',
        rank: diagnosis.rank,
        voided: diagnosis.voided,
      }));

      diagnoses.push(...validDiagnoses);
    }

    // Process Visit Notes
    if (visitNote && Array.isArray(visitNote)) {
      const formattedNotes = visitNote.map((note) => ({
        concept: note.concept, // Keeping original concept data
        note: note.value, // The actual note text
        provider: {
          name: 'Doctor', // Filling in "Doctor" as per request
          role: 'Doctor',
        },
        time: formatTime(parseDate(note.obsDatetime)), // Keeping original timestamp
      }));

      notes.push(...formattedNotes);
    }

    // Sort Diagnoses by Rank
    diagnoses.sort((a, b) => a.rank - b.rank);

    return [diagnoses, notes];
  }, [Diagnosis, visitNote]); // Added proper dependencies

  return (
    <div className={styles.summaryContainer}>
      <p className={styles.diagnosisLabel}>{t('diagnoses', 'Diagnoses')}</p>
      <div className={styles.diagnosesList}>
        {diagnoses.length > 0 ? (
          diagnoses.map((diagnosis, i) => (
            <Tag key={`${diagnosis.diagnosis}-${i}`} type={diagnosis.type}>
              {diagnosis.diagnosis}
            </Tag>
          ))
        ) : (
          <p className={classNames(styles.bodyLong01, styles.text02)} style={{ marginBottom: '0.5rem' }}>
            {t('noDiagnosesFound', 'No diagnoses found')}
          </p>
        )}
      </div>
      <Tabs
        className={classNames(styles.verticalTabs, config.layout === 'tablet' ? styles.tabletTabs : styles.desktopTabs)}
      >
        <TabList aria-label="Visit summary tabs" className={styles.tablist}>
          <Tab
            className={classNames(styles.tab, styles.bodyLong01)}
            id="notes-tab"
            onClick={() => handleTabClick('notes-tab')}
          >
            {t('notes', 'Notes')}
          </Tab>
          <Tab className={styles.tab} id="tests-tab" onClick={() => handleTabClick('tests-tab')}>
            {t('tests', 'Tests')}
          </Tab>
          <Tab className={styles.tab} id="medications-tab" onClick={() => handleTabClick('medications-tab')}>
            {t('medications', 'Medications')}
          </Tab>
          <Tab className={styles.tab} id="encounters-tab" onClick={() => handleTabClick('encounters-tab')}>
            {t('encounters', 'Encounters')}
          </Tab>
        </TabList>
        <TabPanels>
          <TabPanel>
            <NotesSummary notes={notes} />
          </TabPanel>
          <TabPanel></TabPanel>
          <TabPanel></TabPanel>
          <TabPanel></TabPanel>
        </TabPanels>
      </Tabs>
    </div>
  );
};

export default DisplayVisitData;
