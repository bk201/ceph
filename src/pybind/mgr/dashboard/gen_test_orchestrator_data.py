import json


def main():
    config = {
        'host': {
            'count': 3,
            'hostname_prefix': 'node-'
        },
        'hdd': {
            'count': 3,
            'size': 4096,
            'vendor': 'AAA',
            'model': 'aaa'
        },
        'ssd': {
            'count': 1,
            'size': 512,
            'vendor': 'BBB',
            'model': 'bbb'
        },
        'nvme': {
            'count': 1,
            'size': 256,
            'vendor': 'CCC',
            'model': 'ccc'
        },
    }

    result = {
        'inventory': []
    }

    def _create_device(_type, _id, size, vendor, model, rotates, available):
        return dict(type=_type, id=_id, size=size * 1024 * 1024 * 1024, dev_id='{}/{}'.format(vendor, model), rotates=rotates, available=available)

    for i in range(config['host']['count']):
        devices = []
        disk_count = 0

        disk = config['nvme']
        for j in range(disk['count']):
            devices.append(_create_device('ssd',
                                          '/dev/nvme0n{}'.format(j+1),
                                          disk['size'],
                                          disk['vendor'],
                                          disk['model'],
                                          False,
                                          True))

        disk = config['hdd']
        for j in range(disk['count']):
            devices.append(_create_device('hdd',
                                          '/dev/sd{}'.format(chr(0x61 + disk_count)),
                                          disk['size'],
                                          disk['vendor'],
                                          disk['model'],
                                          True,
                                          j != 0))
            disk_count += 1

        disk = config['ssd']
        for j in range(disk['count']):
            devices.append(_create_device('ssd',
                                          '/dev/sd{}'.format(chr(0x61 + disk_count)),
                                          disk['size'],
                                          disk['vendor'],
                                          disk['model'],
                                          False,
                                          True))
            disk_count += 1

        node = {
            'name': '{}{}'.format(config['host']['hostname_prefix'], i),
            'devices': devices
        }
        result['inventory'].append(node)
    
    print(json.dumps(result, indent=2))


if __name__ == '__main__':
    main()