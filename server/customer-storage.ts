import fs from "fs";
import path from "path";
import { randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { fileURLToPath } from "url";

export type PlanName = "Profesional" | "Empresarial";

export type WorkspaceSeed = {
  companies: Array<{
    id: string;
    name: string;
    nif: string;
    address: string;
    phone?: string;
    email?: string;
    logo?: string;
    workingHoursPerWeek: number;
  }>;
  employees: Array<{
    id: string;
    companyId: string;
    name: string;
    email: string;
    phone?: string;
    role: string;
    systemRole: "admin" | "supervisor" | "employee";
    department: string;
    scheduleId: string;
    weeklyHours: number;
    joinDate: string;
    avatar?: string;
    active: boolean;
  }>;
  schedules: Array<{
    id: string;
    name: string;
    companyId: string;
    monday: string;
    tuesday: string;
    wednesday: string;
    thursday: string;
    friday: string;
    saturday: string;
    sunday: string;
  }>;
  entries: Array<unknown>;
  vacations: Array<unknown>;
  activeCompanyId: string;
  currentUserId: string;
};

type CustomerRecord = {
  id: string;
  email: string;
  planName: PlanName;
  stripeSessionId: string;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
  stripeProductId?: string;
  stripePriceId?: string;
  stripePaymentStatus?: string;
  status: "pending_activation" | "active" | "canceled";
  activationToken: string;
  companyName?: string;
  adminName?: string;
  passwordHash?: string;
  workspaceSeed?: WorkspaceSeed;
  createdAt: string;
  updatedAt: string;
  activatedAt?: string;
};

type CustomerStoreFile = {
  customers: CustomerRecord[];
};

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const storePath = path.resolve(currentDir, "..", ".local", "customers.json");

function ensureStoreFile() {
  fs.mkdirSync(path.dirname(storePath), { recursive: true });
  if (!fs.existsSync(storePath)) {
    fs.writeFileSync(storePath, JSON.stringify({ customers: [] }, null, 2));
  }
}

function readStore(): CustomerStoreFile {
  ensureStoreFile();
  return JSON.parse(fs.readFileSync(storePath, "utf8")) as CustomerStoreFile;
}

function writeStore(data: CustomerStoreFile) {
  ensureStoreFile();
  fs.writeFileSync(storePath, JSON.stringify(data, null, 2));
}

function createId(prefix: string) {
  return `${prefix}_${randomBytes(8).toString("hex")}`;
}

function createToken() {
  return randomBytes(24).toString("hex");
}

function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${derived}`;
}

function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(":");
  if (!salt || !storedHash) {
    return false;
  }

  const derived = scryptSync(password, salt, 64);
  const stored = Buffer.from(storedHash, "hex");

  return stored.length === derived.length && timingSafeEqual(stored, derived);
}

function buildWorkspaceSeed(input: {
  companyName: string;
  email: string;
  adminName: string;
  planName: PlanName;
}) {
  const companyId = createId("company");
  const scheduleId = createId("schedule");
  const adminId = createId("employee");
  const today = new Date().toISOString().split("T")[0];
  const weeklyHours = input.planName === "Empresarial" ? 40 : 37;

  const workspaceSeed: WorkspaceSeed = {
    companies: [
      {
        id: companyId,
        name: input.companyName,
        nif: "",
        address: "",
        email: input.email,
        workingHoursPerWeek: weeklyHours,
      },
    ],
    employees: [
      {
        id: adminId,
        companyId,
        name: input.adminName,
        email: input.email,
        role: "Administrador",
        systemRole: "admin",
        department: "Dirección",
        scheduleId,
        weeklyHours,
        joinDate: today,
        active: true,
      },
    ],
    schedules: [
      {
        id: scheduleId,
        name: "Horario inicial",
        companyId,
        monday: "09:00-14:00,15:00-18:00",
        tuesday: "09:00-14:00,15:00-18:00",
        wednesday: "09:00-14:00,15:00-18:00",
        thursday: "09:00-14:00,15:00-18:00",
        friday: "08:00-15:00",
        saturday: "",
        sunday: "",
      },
    ],
    entries: [],
    vacations: [],
    activeCompanyId: companyId,
    currentUserId: adminId,
  };

  return workspaceSeed;
}

export const customerStorage = {
  upsertCheckoutSession(input: {
    email: string;
    planName: PlanName;
    stripeSessionId: string;
    stripeCustomerId?: string;
    stripeSubscriptionId?: string;
    stripeProductId?: string;
    stripePriceId?: string;
    stripePaymentStatus?: string;
  }) {
    const store = readStore();
    const existing =
      store.customers.find((customer) => customer.stripeSessionId === input.stripeSessionId) ||
      store.customers.find(
        (customer) =>
          customer.email.toLowerCase() === input.email.toLowerCase() &&
          customer.status !== "canceled",
      );
    const timestamp = new Date().toISOString();

    const customer: CustomerRecord = existing
      ? {
          ...existing,
          email: input.email,
          planName: input.planName,
          stripeSessionId: input.stripeSessionId,
          stripeCustomerId: input.stripeCustomerId ?? existing.stripeCustomerId,
          stripeSubscriptionId:
            input.stripeSubscriptionId ?? existing.stripeSubscriptionId,
          stripeProductId: input.stripeProductId ?? existing.stripeProductId,
          stripePriceId: input.stripePriceId ?? existing.stripePriceId,
          stripePaymentStatus:
            input.stripePaymentStatus ?? existing.stripePaymentStatus,
          updatedAt: timestamp,
        }
      : {
          id: createId("cust"),
          email: input.email,
          planName: input.planName,
          stripeSessionId: input.stripeSessionId,
          stripeCustomerId: input.stripeCustomerId,
          stripeSubscriptionId: input.stripeSubscriptionId,
          stripeProductId: input.stripeProductId,
          stripePriceId: input.stripePriceId,
          stripePaymentStatus: input.stripePaymentStatus,
          status: "pending_activation",
          activationToken: createToken(),
          createdAt: timestamp,
          updatedAt: timestamp,
        };

    if (existing) {
      store.customers = store.customers.map((entry) =>
        entry.id === customer.id ? customer : entry,
      );
    } else {
      store.customers.push(customer);
    }

    writeStore(store);
    return customer;
  },

  getBySessionId(sessionId: string) {
    return readStore().customers.find(
      (customer) => customer.stripeSessionId === sessionId,
    );
  },

  getByActivationToken(token: string) {
    return readStore().customers.find(
      (customer) => customer.activationToken === token,
    );
  },

  activateCustomer(input: {
    activationToken: string;
    companyName: string;
    adminName: string;
    password: string;
  }) {
    const store = readStore();
    const customer = store.customers.find(
      (entry) => entry.activationToken === input.activationToken,
    );

    if (!customer) {
      throw new Error("Token de activacion no valido.");
    }

    const workspaceSeed =
      customer.workspaceSeed ||
      buildWorkspaceSeed({
        companyName: input.companyName,
        email: customer.email,
        adminName: input.adminName,
        planName: customer.planName,
      });

    const updatedCustomer: CustomerRecord = {
      ...customer,
      status: "active",
      companyName: input.companyName,
      adminName: input.adminName,
      passwordHash: hashPassword(input.password),
      workspaceSeed,
      activatedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    store.customers = store.customers.map((entry) =>
      entry.id === updatedCustomer.id ? updatedCustomer : entry,
    );
    writeStore(store);

    return updatedCustomer;
  },

  authenticateCustomer(email: string, password: string) {
    const customer = readStore().customers.find(
      (entry) =>
        entry.email.toLowerCase() === email.toLowerCase() &&
        entry.status === "active" &&
        entry.passwordHash,
    );

    if (!customer || !customer.passwordHash) {
      return undefined;
    }

    return verifyPassword(password, customer.passwordHash) ? customer : undefined;
  },

  updateSubscriptionStatus(
    stripeSubscriptionId: string,
    status: CustomerRecord["status"],
  ) {
    const store = readStore();
    let changed = false;

    store.customers = store.customers.map((customer) => {
      if (customer.stripeSubscriptionId !== stripeSubscriptionId) {
        return customer;
      }

      changed = true;
      return {
        ...customer,
        status,
        updatedAt: new Date().toISOString(),
      };
    });

    if (changed) {
      writeStore(store);
    }
  },
};
