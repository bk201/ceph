export class Device {
  hostname: string;
  uid: string;

  blank: boolean;
  type: string;
  id: string;
  size: number;
  rotates: boolean;
  available: boolean;
  dev_id: string;
  extended: any;
  osd_id: string;
}

export class InventoryNode {
  name: string;
  devices: Device[];
}
