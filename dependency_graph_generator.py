import yaml
import graphviz

def generate_dependency_graph(registry_file, output_file):
    with open(registry_file, 'r') as f:
        registry = yaml.safe_load(f)

    dot = graphviz.Digraph(comment='System Dependency Graph')

    for system in registry['systems']:
        dot.node(system['system_name'], system['system_name'])

    for system in registry['systems']:
        for dependency in system.get('dependencies', []):
            dot.edge(system['system_name'], dependency)

    dot.render(output_file, view=False, format='png')

if __name__ == '__main__':
    generate_dependency_graph('systems.registry.yaml', 'dependency_graph')
