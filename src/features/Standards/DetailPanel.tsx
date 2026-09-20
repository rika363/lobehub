'use client';

import { Center, Flexbox, Icon } from '@lobehub/ui';
import { Button, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import dayjs from 'dayjs';
import { ExternalLinkIcon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import type { StandardItem } from '@/services/expertise';

import { useStandardSources } from './hooks';

const styles = createStaticStyles(({ css }) => ({
  panel: css`
    overflow-y: auto;
    flex: none;

    width: 380px;
    padding-block: 24px;
    padding-inline: 20px;
    border-inline-start: 1px solid ${cssVar.colorBorderSecondary};
  `,
  source: css`
    padding-block-end: 12px;
    border-block-end: 1px solid ${cssVar.colorBorderSecondary};
  `,
  title: css`
    text-wrap: pretty;
  `,
}));

const SECTION_LABELS = {
  how: 'standards.section.how',
  limits: 'standards.section.limits',
  why: 'standards.section.why',
} as const;

const READING_ORDER = ['why', 'how', 'limits'] as const;

interface DetailPanelProps {
  standard?: StandardItem;
}

/**
 * What one standard rests on. The sources list is the point of the panel: a standard the reviewer
 * cannot trace back to their own words is indistinguishable from one a model invented.
 */
const DetailPanel = ({ standard }: DetailPanelProps) => {
  const { t } = useTranslation('memory');
  const { data: sources } = useStandardSources(standard?.id);

  if (!standard)
    return (
      <Center className={styles.panel}>
        <Text fontSize={13} type={'secondary'}>
          {t('standards.detail.empty')}
        </Text>
      </Center>
    );

  const sectionBody = (key: string) =>
    standard.sections?.find((section) => section.key === key)?.body?.trim();

  return (
    <Flexbox className={styles.panel} gap={20}>
      <Flexbox gap={4}>
        <Text fontSize={12} type={'secondary'}>
          {standard.code}
        </Text>
        <Text className={styles.title} fontSize={16} weight={600}>
          {standard.title}
        </Text>
      </Flexbox>

      {READING_ORDER.map((key) => {
        const body = sectionBody(key);
        if (!body) return null;
        return (
          <Flexbox gap={4} key={key}>
            <Text fontSize={12} type={'secondary'}>
              {t(SECTION_LABELS[key])}
            </Text>
            <Text fontSize={13}>{body}</Text>
          </Flexbox>
        );
      })}

      <Flexbox gap={12}>
        <Text fontSize={12} type={'secondary'}>
          {t('standards.detail.sources')}
        </Text>
        {sources?.length ? (
          sources.map((source) => (
            <Flexbox className={styles.source} gap={6} key={source.id}>
              {source.checkTitle && (
                <Text fontSize={13} weight={500}>
                  {source.checkTitle}
                </Text>
              )}
              {source.reviewerComment && (
                <Text fontSize={13} type={'secondary'}>
                  {t('standards.reviewerSaid')}：{source.reviewerComment}
                </Text>
              )}
              <Flexbox horizontal align={'center'} gap={8} justify={'space-between'}>
                <Text fontSize={12} type={'secondary'}>
                  {dayjs(source.createdAt).format('YYYY-MM-DD')}
                </Text>
                {source.acceptanceId && (
                  <Button
                    ghost
                    href={`/acceptance/${source.acceptanceId}`}
                    icon={<Icon icon={ExternalLinkIcon} />}
                    size={'small'}
                    target={'_blank'}
                    type={'link'}
                  >
                    {t('standards.openAcceptance')}
                  </Button>
                )}
              </Flexbox>
            </Flexbox>
          ))
        ) : (
          <Text fontSize={13} type={'secondary'}>
            {t('standards.detail.sourcesEmpty')}
          </Text>
        )}
      </Flexbox>
    </Flexbox>
  );
};

export default DetailPanel;
