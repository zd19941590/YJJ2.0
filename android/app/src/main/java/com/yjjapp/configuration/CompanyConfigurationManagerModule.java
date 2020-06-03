package com.yjjapp.configuration;

import java.io.InputStream;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.yjjapp.R;

public class CompanyConfigurationManagerModule extends ReactContextBaseJavaModule {
  private ReactApplicationContext reactContext;
  public CompanyConfigurationManagerModule(ReactApplicationContext reactContext) {
    super(reactContext);
    this.reactContext = reactContext;
  }

  @Override
  public String getName() {
    return "CompanyConfigurationManager";
  }

  @Override
  public Map<String, Object> getConstants() {
    final Map<String, Object> constants = new HashMap<>();
    Properties config =getProperties();
    if (config != null) {
            constants.put("CompanyAppConfigs", config);
            constants.put("CompanyAppConfig", config.getProperty("CompanyAppConfig"));
    }
    return constants;
  }
  /**
   * read config properties,if someone do something on company style or else, read native properties can be
   * store the diffrent style in diffrent company, like code-push,in this way , javascript read config.properties
   * and keep diffrent style;
   * @return
   */
  public Properties getProperties() {
    Properties properties = new Properties();
    if (reactContext==null){
      reactContext=getReactApplicationContext();
    }
    InputStream is = null;
    try {
        is = reactContext.getResources().openRawResource(R.raw.config);
        properties.load(is);
        is.close();
    }catch (Exception e){
      e.printStackTrace();
    }
    return properties;
  }
}