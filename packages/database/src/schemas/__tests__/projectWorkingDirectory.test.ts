// @vitest-environment node
import { eq, inArray } from 'drizzle-orm';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import { getTestDB } from '../../core/getTestDB';
import {
  agents,
  devices,
  environmentInstances,
  environments,
  projects,
  projectWorkingDirectories,
  topics,
  users,
} from '..';

const serverDB = await getTestDB();
const userId = 'project-working-directory-schema-user';

const createProjectFixture = async () => {
  const [coordinator] = await serverDB
    .insert(agents)
    .values({ title: 'Coordinator', userId, virtual: true })
    .returning();
  const [project] = await serverDB
    .insert(projects)
    .values({
      coordinatorAgentId: coordinator.id,
      identifier: 'PWD',
      name: 'Directory project',
      userId,
    })
    .returning();
  const [device] = await serverDB
    .insert(devices)
    .values({ deviceId: 'project-working-directory-device', identitySource: 'fallback', userId })
    .returning();
  const [environment] = await serverDB
    .insert(environments)
    .values({ configuration: {}, name: 'lobehub', userId })
    .returning();
  const [instance] = await serverDB
    .insert(environmentInstances)
    .values({
      configurationSnapshot: {},
      deviceId: device.id,
      environmentId: environment.id,
      kind: 'device',
      name: 'lobehub',
      workingDirectory: '/Users/name/Code/lobehub',
    })
    .returning();

  return { coordinator, device, environment, instance, project };
};

beforeEach(async () => {
  await serverDB.insert(users).values({ id: userId });
});

afterEach(async () => {
  await serverDB.delete(projectWorkingDirectories);
  await serverDB
    .delete(environmentInstances)
    .where(
      inArray(
        environmentInstances.environmentId,
        serverDB
          .select({ id: environments.id })
          .from(environments)
          .where(eq(environments.userId, userId)),
      ),
    );
  await serverDB.delete(environments).where(eq(environments.userId, userId));
  await serverDB.delete(users).where(eq(users.id, userId));
});

describe('Project working directory schema', () => {
  it('persists an instance-backed project directory with safe defaults', async () => {
    const { instance, project } = await createProjectFixture();
    const [directory] = await serverDB
      .insert(projectWorkingDirectories)
      .values({
        environmentInstanceId: instance.id,
        isPrimary: true,
        name: 'lobehub',
        projectId: project.id,
      })
      .returning();

    expect(directory).toMatchObject({
      environmentInstanceId: instance.id,
      isPrimary: true,
      permission: 'readWrite',
      projectId: project.id,
    });
  });

  it('allows only one primary directory and one binding per project and instance', async () => {
    const { device, environment, instance, project } = await createProjectFixture();
    const values = {
      environmentInstanceId: instance.id,
      isPrimary: true,
      name: 'lobehub',
      projectId: project.id,
    };

    await serverDB.insert(projectWorkingDirectories).values(values);
    await expect(serverDB.insert(projectWorkingDirectories).values(values)).rejects.toThrow();

    const [secondInstance] = await serverDB
      .insert(environmentInstances)
      .values({
        configurationSnapshot: {},
        deviceId: device.id,
        environmentId: environment.id,
        kind: 'device',
        name: 'lobehub-cloud',
        workingDirectory: '/Users/name/Code/lobehub-cloud',
      })
      .returning();
    await expect(
      serverDB.insert(projectWorkingDirectories).values({
        ...values,
        environmentInstanceId: secondInstance.id,
        name: 'lobehub-cloud',
      }),
    ).rejects.toThrow();
  });

  it('keeps project membership when a topic directory is unbound', async () => {
    const { coordinator, instance, project } = await createProjectFixture();
    const [directory] = await serverDB
      .insert(projectWorkingDirectories)
      .values({
        environmentInstanceId: instance.id,
        name: 'lobehub',
        projectId: project.id,
      })
      .returning();
    const [topic] = await serverDB
      .insert(topics)
      .values({
        agentId: coordinator.id,
        projectId: project.id,
        projectWorkingDirectoryId: directory.id,
        title: 'Implement project grouping',
        userId,
      })
      .returning();

    await serverDB
      .delete(projectWorkingDirectories)
      .where(eq(projectWorkingDirectories.id, directory.id));

    const [persisted] = await serverDB.select().from(topics).where(eq(topics.id, topic.id));
    expect(persisted).toMatchObject({
      projectId: project.id,
      projectWorkingDirectoryId: null,
    });
  });

  it('blocks removing a device or environment while an instance references it', async () => {
    const { device, environment } = await createProjectFixture();

    await expect(serverDB.delete(devices).where(eq(devices.id, device.id))).rejects.toThrow();
    await expect(
      serverDB.delete(environments).where(eq(environments.id, environment.id)),
    ).rejects.toThrow();
  });
});
