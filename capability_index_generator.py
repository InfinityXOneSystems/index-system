import yaml
import json

def generate_capability_index(registry_file, output_file):
    with open(registry_file, 'r') as f:
        registry = yaml.safe_load(f)

    capability_index = {}
    for system in registry['systems']:
        system_name = system['system_name']
        for capability in system.get('capabilities', []):
            if capability not in capability_index:
                capability_index[capability] = []
            capability_index[capability].append(system_name)

    with open(output_file, 'w') as f:
        json.dump(capability_index, f, indent=2)

if __name__ == '__main__':
    generate_capability_index('systems.registry.yaml', 'capability_index.json')
