import { useClientDataSWR } from '@/libs/swr';
import { swrKeys } from '@/libs/swr/keys';
import { expertiseService } from '@/services/expertise';

/** The reviewer's own standards plus the backlog of rejected rounds nothing has read yet. */
export const useStandards = () =>
  useClientDataSWR(swrKeys.expertise.standards(), () => expertiseService.listStandards());

export const useStandardSources = (lessonId?: string) =>
  useClientDataSWR(lessonId ? swrKeys.expertise.standardSources(lessonId) : null, () =>
    expertiseService.standardSources(lessonId!),
  );
