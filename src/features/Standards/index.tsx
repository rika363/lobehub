'use client';

import { Empty, Flexbox } from '@lobehub/ui';
import { Text } from '@lobehub/ui/base-ui';
import { createStaticStyles } from 'antd-style';
import { ScaleIcon } from 'lucide-react';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import AsyncBoundary from '@/components/AsyncBoundary';
import Loading from '@/components/Loading/BrandTextLoading';
import NavHeader from '@/features/NavHeader';
import WideScreenContainer from '@/features/WideScreenContainer';

import DetailPanel from './DetailPanel';
import { useStandards } from './hooks';
import StandardRow from './StandardRow';

const styles = createStaticStyles(({ css }) => ({
  body: css`
    overflow-y: auto;
    display: flex;
    flex: 1;
  `,
}));

/**
 * The reviewer's delivery standards.
 *
 * Read-only on purpose: every standard here was distilled from a round the reviewer sent back, so
 * an "add a standard" button would invite exactly the hand-written rules this replaces.
 */
const Standards = () => {
  const { t } = useTranslation('memory');
  const { data, error, isLoading, mutate } = useStandards();
  const [selectedId, setSelectedId] = useState<string>();

  const groups = (data?.groups ?? []).filter((group) => group.standards.length > 0);
  const standards = groups.flatMap((group) => group.standards);
  const selected = standards.find((standard) => standard.id === selectedId);
  const isEmpty = !isLoading && !error && standards.length === 0;
  // Codes restart at P-01 per domain, so once a second domain is bound the list has to say which
  // domain a standard belongs to or the same code appears twice with nothing to tell them apart.
  const showDomainTitles = groups.length > 1;

  return (
    <Flexbox height={'100%'} width={'100%'}>
      <NavHeader />
      <Flexbox horizontal flex={1} height={'100%'} width={'100%'}>
        <Flexbox className={styles.body}>
          <WideScreenContainer gap={24} paddingBlock={'24px 64px'}>
            <Flexbox gap={4}>
              <Text fontSize={26} weight={700}>
                {t('standards.title')}
              </Text>
              <Text type={'secondary'}>{t('standards.subtitle')}</Text>
            </Flexbox>
            <AsyncBoundary
              data={data}
              error={error}
              errorVariant={'page'}
              isEmpty={isEmpty}
              isLoading={isLoading}
              loading={<Loading debugId={'Standards'} />}
              empty={
                <Empty
                  icon={ScaleIcon}
                  title={t('standards.empty.title')}
                  description={
                    <Flexbox align={'center'} gap={8}>
                      <span>{t('standards.empty.description')}</span>
                      {Boolean(data?.backlogRounds) && (
                        <Text fontSize={13} type={'secondary'}>
                          {t('standards.backlog', { count: data!.backlogRounds })}
                        </Text>
                      )}
                    </Flexbox>
                  }
                />
              }
              onRetry={() => mutate()}
            >
              <Flexbox gap={24}>
                {groups.map((group) => (
                  <Flexbox gap={8} key={group.domain.id}>
                    {showDomainTitles && (
                      <Text fontSize={13} type={'secondary'}>
                        {group.domain.title}
                      </Text>
                    )}
                    {group.standards.map((standard) => (
                      <StandardRow
                        active={standard.id === selectedId}
                        key={standard.id}
                        standard={standard}
                        onSelect={() => setSelectedId(standard.id)}
                      />
                    ))}
                  </Flexbox>
                ))}
              </Flexbox>
            </AsyncBoundary>
          </WideScreenContainer>
        </Flexbox>
        {standards.length > 0 && (
          <DetailPanel standard={selected} onClose={() => setSelectedId(undefined)} />
        )}
      </Flexbox>
    </Flexbox>
  );
};

export default Standards;
