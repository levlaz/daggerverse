# Generate examples for a given module
generate-examples module:
    dagger -m github.com/kpenfound/dagger-modules/mdk --source {{module}} call generate examples -o {{module}}