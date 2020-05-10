# mission
Mission Prediction Map


# Getting Started

Create a virutal environment and install the requirements

```bash
python -m pip install -r requirements.txt
python -m pip install -r requirements-dev.txt
```

Configure an environment variable named `MAP_API_KEY` 
The Bing test environment key is `AjtUzWJBHlI3Ma_Ke6Qv2fGRXEs0ua5hUQi54ECwfXTiWsitll4AkETZDihjcfeI`

# Debug on Azure App Service

Navigate to https://appname.scm.azurewebsites.net/ to view web app tools 

Look at current docker logs

# References
- Bing Map Auto-suggest https://www.bing.com/api/maps/sdkrelease/mapcontrol/isdk/autosuggestui
- Setup Custom domain for Web app https://docs.microsoft.com/en-us/azure/app-service/app-service-web-tutorial-custom-domain
- Configure Bing Map Security https://blogs.bing.com/maps/2018-05/Announcing-Enhanced-Security-for-Bing-Maps-API-Keys
