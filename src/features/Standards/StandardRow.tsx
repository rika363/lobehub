'use client';

import { Block, Flexbox } from '@lobehub/ui';
import { Tag, Text } from '@lobehub/ui/base-ui';
import { createStaticStyles, cssVar } from 'antd-style';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';

import type { StandardItem } from '@/services/expertise';

const styles = createStaticStyles(({ css }) => ({
  active: css`
    border-color: ${cssVar.colorPrimaryBorder};
    background: ${cssVar.colorFillQuaternary};
  `,
  code: css`
    flex: none;
    font-family: ${cssVar.fontFamilyCode};
  `,
  row: css`
    cursor: pointer;
    padding-block: 12px;
    padding-inline: 16px;

    &:hover {
      background: ${cssVar.colorFillQuaternary};
    }
  `,
  title: css`
    text-wrap: pretty;
  `,
}));

interface StandardRowProps {
  active?: boolean;
  onSelect: () => void;
  standard: StandardItem;
}

/**
 * One standard as the reviewer reads it: the sentence first, then only the counts that exist
 * today. Judged/blocked columns are deliberately absent — nothing compiles a standard into a
 * criterion yet, so a "0 blocked" column would read as a failure rather than as "not built".
 */
const StandardRow = ({ active, onSelect, standard }: StandardRowProps) => {
  const { t } = useTranslation('memory');

  return (
    <Block
      className={[styles.row, active && styles.active].filter(Boolean).join(' ')}
      gap={6}
      variant={'outlined'}
      onClick={onSelect}
    >
      <Flexbox horizontal align={'baseline'} gap={10}>
        <Text className={styles.code} fontSize={12} type={'secondary'}>
          {standard.code}
        </Text>
        <Text className={styles.title} weight={500}>
          {standard.title}
        </Text>
      </Flexbox>
      <Flexbox horizontal align={'center'} gap={8} wrap={'wrap'}>
        {/* Only the exception is worth a tag: "mechanism" is the norm, and a badge repeated on
            every row spends attention without telling the reader anything. */}
        {standard.reasonKind === 'taste' && <Tag size={'small'}>{t('standards.basis.taste')}</Tag>}
        <Text fontSize={12} type={'secondary'}>
          {t('standards.meta.rejections', { count: standard.hitCount })}
          {' · '}
          {t('standards.meta.rounds', { count: standard.hitRunCount })}
          {standard.lastHitAt &&
            ` · ${t('standards.meta.lastSeen', { time: dayjs(standard.lastHitAt).fromNow() })}`}
        </Text>
      </Flexbox>
    </Block>
  );
};

export default StandardRow;
