# yum install -y epel
# yum install -y python36-toml
import argparse

import toml


def parse():
    parser = argparse.ArgumentParser(description='Update unsecure registries of container runtime.')
    parser.add_argument('registry', nargs='+',
                        help='Unsecure registry.')
    parser.add_argument('--config',
                        default='/etc/containers/registries.conf',
                        help='Container runtime registries config.')
    return parser.parse_args()


def main():
    args = parse()
    print('Allow unsecure registries: {}'.format(args.registry))
    with open(args.config) as f:
        config = toml.loads(f.read())

    config['registries']['insecure']['registries'] = args.registry
    with open(args.config, 'w') as f:
        f.write(toml.dumps(config))


if __name__ == '__main__':
    main()
