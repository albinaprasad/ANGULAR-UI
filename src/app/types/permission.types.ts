export type Permissions = {
    id: number;
    name: string;
    codename: string;
}

export type PermissionGroup = {
    id: number;
    name: string;
}

export type PermissionAction = 'view' | 'change' | 'delete' | 'add';

export type TablePermissions = {
    table: string;
    canView: boolean;
    canChange: boolean;
    canDelete: boolean;
    canAdd: boolean;
    permissionIds: Partial<Record<PermissionAction, number>>;
}

export type PermissionToggleChange = {
    table: string;
    action: PermissionAction;
    assigned: boolean;
}
