# Get IP 
Get the IP Address of Current Running Container 

You can use this as a library or call it directly. 

## Example Query 
echo '{getIp{run{stdout}}}' | dagger query --progress=plain

## Example Query in CI Environment
echo '{getIp{run{stdout}}}' | dagger query --progress=plain