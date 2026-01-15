export type UserRole = "manager" | "sommelier" | "expo" | "server" | string;

export type Action =
  | "tables.arrive"
  | "tables.seat"
  | "service.advance_step"
  | "service.undo"
  | "wines.add_to_table"
  | "wines.remove_from_table"
  | "guests.edit"
  | "inventory.view"
  | "inventory.edit"
  | "settings.permissions_edit";

export type RoleMatrix = Record<string, Partial<Record<Action, boolean>>>;

// TEMP defaults (later: load from backend per company)
export const DEFAULT_ROLE_ACTIONS: RoleMatrix = {
  server: {
    "tables.arrive": true,
    "tables.seat": true,

    "service.advance_step": false,
    "service.undo": false,

    "wines.add_to_table": false,
    "wines.remove_from_table": false,

    "guests.edit": false,
    "inventory.view": true,
    "inventory.edit": false,

    "settings.permissions_edit": false,
  },

  expo: {
    "tables.arrive": true,
    "tables.seat": true,

    "service.advance_step": true,
    "service.undo": true,

    "wines.add_to_table": true,
    "wines.remove_from_table": true,

    "guests.edit": true,
    "inventory.view": true,
    "inventory.edit": false,

    "settings.permissions_edit": false,
  },

  sommelier: {
    "tables.arrive": false,
    "tables.seat": false,

    "service.advance_step": true,
    "service.undo": true,

    "wines.add_to_table": true,
    "wines.remove_from_table": true,

    "guests.edit": true,
    "inventory.view": true,
    "inventory.edit": true,

    "settings.permissions_edit": false,
  },

  manager: {
    "tables.arrive": true,
    "tables.seat": true,

    "service.advance_step": true,
    "service.undo": true,

    "wines.add_to_table": true,
    "wines.remove_from_table": true,

    "guests.edit": true,
    "inventory.view": true,
    "inventory.edit": true,

    "settings.permissions_edit": true,
  },
};

export function can(role: UserRole | undefined, action: Action) {
  const r = role ?? "server";
  return !!DEFAULT_ROLE_ACTIONS[r]?.[action];
}
