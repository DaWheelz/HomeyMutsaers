var version = "1.1.2"

var CLIENT_ID = '5cbb504da1fc782009f52e46';
var CLIENT_SECRET = 'gvhs0gebgir8vz8yo2l0jfb49u9xzzhrkuo1uvs8';

var request = new XMLHttpRequest();

var homey;
var outdoortemperature
var indoortemperature
var homeydashdevicebrightness
var locale = 'en'
var theme;
var urltoken;
var uid;
var styleElem;
var $content
var $settingspanel
var iframesettings;
var lang = getQueryVariable('lang');
if (lang) {
  locale = lang;
}
var texts = getTexts(locale)

loadScript(locale, setLocale)

function openTab(tabName) {
  var x = document.getElementsByClassName("tab");
  for (var i = 0; i < x.length; i++) {
    x[i].style.display = "none";
  }
  document.getElementById(tabName).style.display = "block";
}

window.addEventListener('load', function () {

  //google.charts.load('current', { packages: ['corechart', 'line'] });
  //google.charts.setOnLoadCallback(drawBasic);


  openTab("row1");

  //var homey;
  var me;
  var sunrise = "";
  var sunset = "";
  var tod = "";
  var dn = "";
  var batteryAlarm = false;
  var nrMsg = 8;
  var faultyDevice = false;
  var nameChange = false;
  var longtouch = false;
  var showTime;
  var cancelUndim = false;
  var currentBrightness;
  var selectedDevice;
  var slideDebounce = false;
  var sliderUnit = "";

  $settingspanel = document.getElementById('settings-panel');
  var $sliderpanel = document.getElementById('slider-panel');
  var $slider = document.getElementById('slider');
  var $sliderclose = document.getElementById('slider-close');
  var $slidericon = document.getElementById('slider-icon');
  var $slidercapability = document.getElementById('slider-capability');
  var $slidername = document.getElementById('slider-name');
  var $slidervalue = document.getElementById('slider-value');
  var $container = document.getElementById('container');

  var $containerinner = document.getElementById('container-inner');

  var $header = document.getElementById('header');
  var $weather = document.getElementById('weather');
  var $sunrisetime = document.getElementById('sunrise-time');
  var $sunsettime = document.getElementById('sunset-time');
  var $weatherStateIcon = document.getElementById('weather-state-icon');
  var $weatherTemperature = document.getElementById('weather-temperature');
  var $weatherroof = document.getElementById('weather-roof');
  var $weathertemperatureinside = document.getElementById('weather-temperature-inside');
  var $text = document.getElementById('text');
  var $textLarge = document.getElementById('text-large');
  var $textSmall = document.getElementById('text-small');
  var $details = document.getElementById('details');
  var $settingsIcon = document.getElementById('settings-icon');
  var $logo = document.getElementById('logo');
  $content = document.getElementById('content');
  var $row1 = document.getElementById('row1');
  var $flows = document.getElementById('flows');
  var $favoriteflows = document.getElementById('favorite-flows');
  var $flowsInner = document.getElementById('flows-inner');
  var $groupsInner = document.getElementById('groups-inner');
  var $row2 = document.getElementById('row2');
  var $devices = document.getElementById('devices');
  var $favoritedevices = document.getElementById('favorite-devices');
  var $devicesInner = document.getElementById('devices-inner');
  var $row3 = document.getElementById('row3');
  var $alarms = document.getElementById('alarms');
  var $favoritegroups = document.getElementById('favorite-groups');
  var $alarmsInner = document.getElementById('alarms-inner');
  var $cameraInner = document.getElementById('camera');
  var $energyconsumpPopup = document.getElementById('energy-consumption-popup');
  var $powerconsumpicon = document.getElementById('power-consumption-icon');
  var $powerconsump = document.getElementById('power-consumption');
  var themetoggle = document.querySelector('input[name=theme]');

  const bgcolor = document.documentElement.style.getPropertyValue('--bg');
  const bgcardcolor = document.documentElement.style.getPropertyValue('--bg-card');
  const textcolor = document.documentElement.style.getPropertyValue('--color-text');

  let trans = () => {
    document.documentElement.classList.add('transition');
    window.setTimeout(() => {
      document.documentElement.classList.remove('transition');
    }, 200)
  }
  themetoggle.addEventListener('change', function () {
    if (this.checked) {
      trans()
      document.documentElement.setAttribute('data-theme', 'dark');
      setCookie("darkmode", true, 365)
    } else {
      trans()
      setCookie("darkmode", false, 365)
      document.documentElement.setAttribute('data-theme', 'light')
    }
  })

  var order = getCookie("order")
  if (order != "") {
    row = order.split(",")
  } else {
    row = "1,2,3".split(",")
  }

  $row1.style.order = row[0]
  $row2.style.order = row[1]
  $row3.style.order = row[2]

  $row2.style.display = "none";
  $row3.style.display = "none";

  try {
    $favoriteflows.innerHTML = texts.favoriteflows
    $favoritedevices.innerHTML = texts.favoritedevices
    $favoritegroups.innerHTML = texts.groups
  } catch (err) { }

  $logo.addEventListener('touchstart', function () {
    logoStart();
  });

  $logo.addEventListener('mouseup', function () {
    timeout = setTimeout(function () {
      longtouch = false;
    }, 100)
    $logo.classList.remove('startTouch')
  });

  $logo.addEventListener('touchend', function () {
    timeout = setTimeout(function () {
      longtouch = false;
    }, 200)
    $logo.classList.remove('startTouch')
  });

  $logo.addEventListener('click', function () {
    if (longtouch) { return } // No click when longtouch was performed
    window.location.reload();
  });

  $sliderclose.addEventListener('click', function () {
    $sliderpanel.style.display = "none"
  })

  function logoStart() {
    longtouch = false;
    $logo.classList.add('startTouch')
    timeout = setTimeout(function () {
      currentBrightness = $container.style.opacity * 100
      var undim = (currentBrightness + 50)
      if (undim > 100) { undim = 100 }
      setBrightness(undim)
      timeout2 = setTimeout(function () {
        if (!cancelUndim) {
          setBrightness(currentBrightness)
        }
      }, 7500)
    }, 300)
  }

  $settingsIcon.addEventListener('click', function () {
    renderSettingsPanel();
  })

  outdoortemperature = getCookie("outdoortemperature")
  if (outdoortemperature == undefined || outdoortemperature == "") { outdoortemperature = "homey" }

  indoortemperature = getCookie("indoortemperature")
  if (indoortemperature != "" && indoortemperature != "none") {
    $weatherroof.style.visibility = "visible"
    $weathertemperatureinside.style.visibility = "visible"
  }



  $powerconsumpicon.style.visibility = "visible"

  showTime = getCookie("showtime")
  showTime = (showTime == "true") ? true : false;
  renderText();
  later.setInterval(function () {
    renderText();
  }, later.parse.text('every 1 second'));

  //toon api requests every 5 minutes
  later.setInterval(function () {
    getPowerUsageDevices()
  }, later.parse.text('every 5 minute'));


  var api = new AthomCloudAPI({
    clientId: CLIENT_ID,
    clientSecret: CLIENT_SECRET,
  });

  theme = getQueryVariable('theme');
  if (theme == undefined) {
    theme = "web";
  }

  var $css = document.createElement('link');
  $css.rel = 'stylesheet';
  $css.type = 'text/css';
  $css.href = './css/themes/' + theme + '.css';
  document.head.appendChild($css);

  var backgroundfromurl = getQueryVariable('background');
  if (backgroundfromurl == undefined) { backgroundfromurl = "" }

  var vadjust = getQueryVariable('vadjust');
  if (vadjust == undefined) { vadjust = 0 }

  var logofromurl = getQueryVariable('logo');
  if (logofromurl == undefined) { logofromurl = "" }

  var zoom = getCookie("zoom")
  $content.style.zoom = zoom;

  var token = getQueryVariable('token');
  urltoken = token;

  if (token == undefined || token == "undefined" || token == "") {
    $container.innerHTML = "<br /><br /><br /><br /><center>homeydash.com<br /><br />Please log-in at<br /><br /><a href='https://homey.ink'>homey.ink</a></center><br /><br /><center><a href='https://community.athom.com/t/homeydash-com-a-homey-dashboard/13509'>More information</a></center>"
    return
  }
  /*
  uid = token.slice(-5)
  this.console.log(uid) // MzIn0
  */
  try { token = atob(token) }
  catch (err) {
    $container.innerHTML = "<br /><br /><br /><br /><center>homeydash.com<br /><br />Token invalid. Please log-in again.<br /><br /><a href='https://homey.ink'>homey.ink</a></center><br /><br /><center><a href='https://community.athom.com/t/homeydash-com-a-homey-dashboard/13509'>More information</a></center>"
    return
  }
  token = JSON.parse(token);
  api.setToken(token);

  api.isLoggedIn().then(function (loggedIn) {
    if (!loggedIn)
      $container.innerHTML = "<br /><br /><br /><br /><center>homeydash.com<br /><br />Token Expired. Please log-in again.<br /><br /><a href='https://homey.ink'>homey.ink</a></center>"
    return
    //throw new Error('Token Expired. Please log-in again.');
  }).then(function () {
    return api.getAuthenticatedUser();
  }).then(function (user) {
    return user.getFirstHomey();
  }).then(function (homey) {
    return homey.authenticate();
  }).then(function (homey_) {
    homey = homey_;

    renderHomey();
    later.setInterval(function () {
      renderHomey();
    }, later.parse.text('every 1 hour'));

  }).catch(console.error);

  function getPowerUsageDevices() {
    request.open('GET', 'https://api.toon.eu/toon/v3/99908/status', true)
    request.setRequestHeader('Authorization', 'Bearer e2e95548-f283-49d4-b695-8083d240daca');

    request.onload = function () {
      var data = JSON.parse(this.response);
      if (request.status >= 200 && request.status < 400) {
        $powerconsump.innerHTML = data.powerUsage.value
      } else {
        console.log('error')
      }
    }
    request.send()
  }

  function renderHomey() {

    getPowerUsageDevices()

    homey.users.getUsers().then(function (users) {
      for (user in users) {
        /*
        console.log("avatar:   " + users[user].avatar)
        console.log("asleep:   " + users[user].asleep)
        console.log("present:  " + users[user].present)
        console.log("enabled:  " + users[user].enabled)
        console.log("verifeid: " + users[user].verified)
        */
      }
    }).catch(console.error);

    homey.users.getUserMe().then(function (user) {
      me = user;
      me.properties = me.properties || {};
      me.properties.favoriteFlows = me.properties.favoriteFlows || [];
      me.properties.favoriteDevices = me.properties.favoriteDevices || [];

      homey.i18n.getOptionLanguage().then(function (language) {
      }).catch(console.error);

      homey.flowToken.getFlowTokens().then(function (tokens) {
        for (token in tokens) {
          if (tokens[token].id == "sunrise" && tokens[token].uri == "homey:manager:cron") {
            sunrise = tokens[token].value
          }
          if (tokens[token].id == "sunset" && tokens[token].uri == "homey:manager:cron") {
            sunset = tokens[token].value
          }
        }
        if (sunrise != "" || sunset != "") {
          calculateTOD();
          renderSunevents();
        }
      }).catch(console.error);

      renderImages();

      homey.weather.getWeather().then(function (weather) {
        return renderWeather(weather);
      }).catch(console.error);

      homey.flow.getFlows().then(function (flows) {
        var favoriteFlows = me.properties.favoriteFlows.map(function (flowId) {
          return flows[flowId];
        }).filter(function (flow) {
          return !!flow;
        });
        return renderFlows(favoriteFlows);
      }).catch(console.error);

      homey.devices.getDevices().then(function (devices) {
        var favoriteDevices = me.properties.favoriteDevices.map(function (deviceId) {
          return devices[deviceId];
        }).filter(function (device) {
          return !!device;
        }).filter(function (device) {
          if (!device.ui) return false;
          //if(!device.ui.quickAction) return false;
          return true;
        });
        renderTable(favoriteDevices)
        renderGroups(favoriteDevices);

        favoriteDevices.forEach(function (device) {
          // console.log(device.name)
          // console.log(device.capabilitiesObj)
          if (!device.ready) {
            faultyDevice = true;
            return
          }

          if (device.ui.quickAction) {
            device.makeCapabilityInstance(device.ui.quickAction, function (value) {
              var $deviceElement = document.getElementById('device:' + device.id);
              if ($deviceElement) {
                $deviceElement.classList.toggle('on', !!value);
              }
            });
          }
          if (device.capabilitiesObj.dim) {
            device.makeCapabilityInstance('dim', function (value) {
              var $deviceElement = document.getElementById('device:' + device.id);
              if ($deviceElement) {
                var $valueElement = document.getElementById('value:' + device.id + ":dim");
                capability = device.capabilitiesObj['dim']
                renderValue($valueElement, capability.id, capability.value, capability.units)
              }
            });
          }
          if (device.capabilitiesObj.volume_set) {
            device.makeCapabilityInstance('volume_set', function (value) {
              var $deviceElement = document.getElementById('device:' + device.id);
              if ($deviceElement) {
                var $valueElement = document.getElementById('value:' + device.id + ":volume_set");
                capability = device.capabilitiesObj['volume_set']
                renderValue($valueElement, capability.id, capability.value, capability.units)
              }
            });
          }
        });
        homeydashdevicebrightness = getCookie("homeydashdevicebrightness")
        var brightness = 100
        for (item in devices) {
          device = devices[item]
          if (device.ready) {
            if (device.id == indoortemperature) {
              if (device.capabilitiesObj.measure_temperature) {
                value = device.capabilitiesObj.measure_temperature.value
                renderValue($weathertemperatureinside, 'measure_temperature', value)
                device.makeCapabilityInstance('measure_temperature', function (value) {
                  renderValue($weathertemperatureinside, 'measure_temperature', value)
                });
              }
            }
            if (device.id == outdoortemperature) {
              if (device.capabilitiesObj.measure_temperature) {
                value = device.capabilitiesObj.measure_temperature.value
                renderValue($weatherTemperature, 'measure_temperature', value)
                device.makeCapabilityInstance('measure_temperature', function (value) {
                  renderValue($weatherTemperature, 'measure_temperature', value)
                });
              }
            }
            if (device.id == homeydashdevicebrightness) {
              if (device.capabilitiesObj.dim) {
                brightness = Math.round(device.capabilitiesObj.dim.value * 100)
                if (brightness == null) { brightness = 100 }
                if (brightness < 0 || brightness > 100) {
                  console.log(device.name + " dim value is out of bounds")
                  break
                }
                device.makeCapabilityInstance('dim', function (value) {
                  value = Math.round(value * 100)
                  if (value < 0 || value > 100) {
                    console.log(device.name + " dim value is out of bounds")
                  }
                  cancelUndim = true
                  setBrightness(value)
                  timeout2 = setTimeout(function () {
                    cancelUndim = false
                  }, 7500)
                });
              } else {
                console.log(device.name + " device found, device does not have dim capability!")
              }
            }
          }
        }

        setBrightness(brightness)
        return renderDevices(favoriteDevices);

      }).catch(console.error);
    }).catch(console.error);
  }

  function renderImages() {
    var logo = getCookie('logo')
    var darkmode = getCookie('darkmode')
    var css = "";

    styleElem = document.head.appendChild(document.createElement("style"));
    styleElem.innerHTML = "#body:after {" + css + "}";
    if (logo != "") {
      $logo.style.background = "no-repeat center center";
      $logo.style.backgroundImage = "url('" + logo + "')";
      $logo.style.backgroundSize = "contain";
    }
    if (logo == "" && logofromurl != "") {
      $logo.style.background = "no-repeat center center";
      $logo.style.backgroundImage = "url('" + logofromurl + "')";
      $logo.style.backgroundSize = "contain";
    }
  }

  function renderSunevents() {
    $sunrisetime.innerHTML = sunrise;
    $sunsettime.innerHTML = sunset;
  }

  function renderWeather(weather) {
    if (outdoortemperature == "homey") {
      $weatherTemperature.innerHTML = Math.round(weather.temperature);
    }
    $weatherStateIcon.classList.add(weather.state.toLowerCase());
    $weatherStateIcon.style.webkitMaskImage = 'url(img/weather/' + weather.state.toLowerCase() + dn + '.svg)';
    $weatherStateIcon.style.webkitMaskImage = 'url(img/weather/' + weather.state.toLowerCase() + dn + '.svg)';
  }

  function renderTable(devices) {
    var deviceItem = [];
    var energyUsage = "";
    var status = "";
    devices.forEach(function (device) {
      if (device.driverId != "dimmerswitch" && device.driverId != "io_roller_shutter" && device.driverId != "virtual_button") {
        if (device.energyObj.W == null) {
          energyUsage = "-";
        } else {
          energyUsage = Number(device.energyObj.W).toFixed(2) + " W";
        }
        if (device.capabilitiesObj.onoff == undefined || device.capabilitiesObj.onoff.value == false) {
          status = "❌";
        } else {
          status = "✅";
        }
        deviceItem.push({ Apparaat: device.name, Status: status, Type: device.driverId, Verbruik: energyUsage });
      }
    }
    );

    let table = document.querySelector("table");
    let data = Object.keys(deviceItem[0]);

    function generateTableData(table, data) {
      for (let element of data) {
        let row = table.insertRow();
        row.classList.add("tr");
        row.setAttribute("id", "tablerow")
        for (key in element) {
          let cell = row.insertCell();
          let text = document.createTextNode(element[key]);
          cell.appendChild(text);
        }
      }
    }
    generateTableData(table, deviceItem);
  }

  function renderGroups(groups) {
    if (groups != "") {
      $groupsInner.innerHTML = '';
      groups.forEach(function (group) {
        if (group.driverUri == "homey:app:com.swttt.devicegroups") {
          var $group = document.createElement('div');
          $group.id = 'flow-' + group.id;
          $group.classList.add('flow');

          $group.addEventListener('touchstart', function () {
            if (nameChange) { return } // No click when shown capability just changed
            if (longtouch) { return } // No click when longtouch was performed
            var value = !$group.classList.contains('on');
            if (group.capabilitiesObj && group.capabilitiesObj.onoff) {
              $group.classList.toggle('on', value);
            }
            $.notify(group.name + " uitgevoerd", "succes", { align: "center", verticalAlign: "top" });
            homey.devices.setCapabilityValue({
              deviceId: group.id,
              capabilityId: group.ui.quickAction,
              value: value,
            }).catch("Niet uitgevoerd", "warn");
          })

          $groupsInner.appendChild($group);

          var $name = document.createElement('div');
          $name.classList.add('name');
          $name.innerHTML = group.name;
          $group.appendChild($name);

          var $deviceslist = document.createElement('div');
          $deviceslist.classList.add('small-name');
          var str = group.settings.labelDevices;
          var strsplit = str.split(',');
          strsplit.forEach(e => {
            $deviceslist.innerHTML += e + "<br/>";
          })
          $group.appendChild($deviceslist);
        }
      });
    } else {
      $groups.style.visibility = 'hidden';
      $groups.style.height = '0';
      $groups.style.marginBottom = '0';
    }
  }

  function renderFlows(flows) {
    if (flows != "") {
      $flowsInner.innerHTML = '';
      flows.forEach(function (flow) {
        var $flow = document.createElement('div');
        $flow.id = 'flow-' + flow.id;
        $flow.classList.add('flow');
        $flow.addEventListener('click', function () {
          if ($flow.classList.contains('running')) return;
          homey.flow.triggerFlow({
            id: flow.id,
          }).then(function () {

            $flow.classList.add('running');
            setTimeout(function () {
              $flow.classList.remove('running');
            }, 3000);
          }).catch(console.error);
        });
        $flowsInner.appendChild($flow);

        var $play = document.createElement('div');
        $play.classList.add('play');
        $flow.appendChild($play);

        var $name = document.createElement('div');
        $name.classList.add('name');
        $name.innerHTML = flow.name;
        $flow.appendChild($name);
      });
    } else {
      $flows.style.visibility = 'hidden';
      $flows.style.height = '0';
      $flows.style.marginBottom = '0';
    }
  }

  function renderDevices(devices) {
    $devicesInner.innerHTML = '';
    devices.forEach(function (device) {
      if (device.driverUri != "homey:app:com.swttt.devicegroups") {
        if (!device.ready) { return }
        var $deviceElement = document.createElement('div');
        $deviceElement.id = 'device:' + device.id;
        $deviceElement.classList.add('device');
        $deviceElement.classList.toggle('on', device.capabilitiesObj && device.capabilitiesObj[device.ui.quickAction] && device.capabilitiesObj[device.ui.quickAction].value === true);
        if (device.capabilitiesObj && device.capabilitiesObj.button) {
          $deviceElement.classList.toggle('on', true)
        }
        $devicesInner.appendChild($deviceElement);

        if (device.capabilitiesObj && device.capabilitiesObj.alarm_generic && device.capabilitiesObj.alarm_generic.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_motion && device.capabilitiesObj.alarm_motion.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_contact && device.capabilitiesObj.alarm_contact.value ||
          device.capabilitiesObj && device.capabilitiesObj.alarm_vibration && device.capabilitiesObj.alarm_vibration.value
        ) {
          $deviceElement.classList.add('alarm')
        }

        var $icon = document.createElement('div');
        $icon.id = 'icon:' + device.id
        $icon.classList.add('icon');
        $icon.style.webkitMaskImage = 'url(https://icons-cdn.athom.com/' + device.iconObj.id + '-128.png)';
        if (device.name == "Bier" || device.name == "Bier temperatuur") {
          $icon.style.webkitMaskImage = 'url(img/capabilities/beer.png)';
          $icon.style.backgroundImage = 'url(img/capabilities/beer.png)';
          $icon.style.backgroundSize = 'contain'
        }

        $deviceElement.appendChild($icon);

        var $iconCapability = document.createElement('div');
        $iconCapability.id = 'icon-capability:' + device.id
        $iconCapability.classList.add('icon-capability');
        $iconCapability.style.webkitMaskImage = 'url(img/capabilities/blank.png)';
        $deviceElement.appendChild($iconCapability);

        if (device.capabilitiesObj) {
          itemNr = 0
          for (item in device.capabilitiesObj) {
            capability = device.capabilitiesObj[item]
            if (capability.type == "number") {
              var $value = document.createElement('div');
              $value.id = 'value:' + device.id + ':' + capability.id;
              $value.title = capability.title
              $value.classList.add('value');
              selectIcon($value, getCookie(device.id), device, capability)
              renderValue($value, capability.id, capability.value, capability.units)
              if (device.name == "Bier") { renderValue($value, capability.id, capability.value, "") }
              $deviceElement.appendChild($value)
              itemNr = itemNr + 1
            }
          }
          if (itemNr > 0) {
            // start touch/click functions
            $deviceElement.addEventListener('touchstart', function (event) {
              deviceStart($deviceElement, device, event)
            });
            $deviceElement.addEventListener('mousedown', function (event) {
              deviceStart($deviceElement, device, event)
            });

            // stop touch/click functions
            $deviceElement.addEventListener('touchend', function () {
              deviceStop($deviceElement)
            });
            $deviceElement.addEventListener('mouseup', function () {
              deviceStop($deviceElement)
            });
          }

          if (device.capabilitiesObj[device.ui.quickAction]) {

            if (itemNr == 0) {
              // Touch functions
              $deviceElement.addEventListener('touchstart', function () {
                $deviceElement.classList.add('push')
              });
              $deviceElement.addEventListener('touchend', function () {
                $deviceElement.classList.remove('push')
              });
              // Mouse functions
              $deviceElement.addEventListener('mousedown', function () {
                $deviceElement.classList.add('push')
              });
              $deviceElement.addEventListener('mouseup', function () {
                $deviceElement.classList.remove('push')
              });
            }

            $deviceElement.addEventListener('click', function () {
              if (nameChange) { return } // No click when shown capability just changed
              if (longtouch) { return } // No click when longtouch was performed
              var value = !$deviceElement.classList.contains('on');
              if (device.capabilitiesObj && device.capabilitiesObj.onoff) {
                //security cameras
                if (device.driverUri == "homey:app:com.jasperbollen.homey-blink" && device.images[0].imageObj.id != "") {
                  $img = document.createElement('img');
                  $cameraInner.style.visibility = "visible";

                  imgId = device.images[0].imageObj.id
                  $img.innerHTML = "";
                  $cameraInner.innerHTML = "";
                  $img.src = "https://192-168-1-113.homey.homeylocal.com/image/" + imgId + "/image";
                  $img.width = 478;
                  $img.height = 330;
                  $cameraInner.appendChild($img);

                  $imgloc = document.createElement('div');
                  $imgloc.innerHTML = device.name;

                  $cameraInner.appendChild($imgloc);
                } else {
                  $deviceElement.classList.toggle('on', value);
                  homey.devices.setCapabilityValue({
                    deviceId: device.id,
                    capabilityId: device.ui.quickAction,
                    value: value,
                  }).catch(console.error);
                }
              }
            });
          }
        }

        var $nameElement = document.createElement('div');
        $nameElement.id = 'name:' + device.id
        $nameElement.classList.add('name');
        $nameElement.innerHTML = device.name;
        $deviceElement.appendChild($nameElement);
      }
    });
  }

  $cameraInner.addEventListener('click', function () {
    $cameraInner.style.visibility = "hidden";
  });

  // $energyconsumpPopup.addEventListener('click', function () {
  //   $energyconsumpPopup.style.visibility = "hidden";
  // });

  // const valuewh = [];
  // const datewh = [];
  // const formatteddate = [];

  // $powerconsumpicon.addEventListener('click', function () {
  //   $energyconsumpPopup.style.visibility = "visible";
  //   drawBasic();
  // });
  // async function drawBasic() {

  //   await getChartData()

  //   var data = new google.visualization.DataTable();
  //   data.addColumn('number', 'W/uur');

  //   data.addRows(valuewh);

  //   var options = {
  //     hAxis: {
  //       title: 'Time',
  //       slantedText: true,
  //       slantedTextAngle: 90,
  //     },
  //     vAxis: {
  //       title: 'Watt',
  //     },
  //     backgroundColor: bgcardcolor,
  //   };

  //   var chart = new google.visualization.LineChart(document.getElementById('energy-consumption-popup'));

  //   chart.draw(data, options);
  // }

  // function pad(num) { 
  //   return ("0"+num).slice(-2);
  // }
  // function getTimeFromDate(timestamp) {
  //   var date = new Date(timestamp * 1000);
  //   var hours = date.getHours();
  //   var minutes = date.getMinutes();
  //   var seconds = date.getSeconds();
  //   return pad(hours)+":"+pad(minutes)
  // }

  // async function getChartData() {
  //   request.open('GET', 'https://api.toon.eu/toon/v3/99908/consumption/electricity/data', true)
  //   request.setRequestHeader('Authorization', 'Bearer e2e95548-f283-49d4-b695-8083d240daca');

  //   request.onload = function () {
  //     var data = JSON.parse(this.response);
  //     if (request.status >= 200 && request.status < 400) {
  //       data.hours.forEach(function (value) {
  //         valuewh.push(value.peak);
  //         formatteddate.push(getTimeFromDate(value.timestamp))
  //       })
  //     } else {
  //       console.log('error')
  //     }
  //   }
  //   request.send()
  // }

  // //1576789200000
  // console.log(formatteddate)

  // function getDateFromTimestamp(timestamp){
  //   timestamp.forEach(function(stamp){
  //     console.log(stamp)
  //   })
  // }

  // New code start    
  function deviceStart($deviceElement, device, event) {
    if (nameChange) { return }
    longtouch = false;
    $deviceElement.classList.add('startTouch')

    timeout = setTimeout(function () {
      if ($deviceElement.classList.contains('startTouch')) {
        //console.log("first timeout");
        longtouch = true;
        showSecondary(device, event);
      }
    }, 300)
    timeout2 = setTimeout(function () {
      if ($deviceElement.classList.contains('startTouch')) {
        //console.log("second timeout");
        longtouch = true;
        $deviceElement.classList.add('push-long');
        hideSecondary(device);
        valueCycle(device);
      }
    }, 900)
  }

  function deviceStop($deviceElement) {
    timeout = setTimeout(function () {
      longtouch = false;
    }, 100)
    $deviceElement.classList.remove('startTouch')
  }
  // New code end

  function renderText() {
    var now = new Date();
    var hours = now.getHours();
    var minutes = now.getMinutes();
    var seconds = now.getSeconds();

    hours = (hours < 10) ? "0" + hours : hours;
    minutes = (minutes < 10) ? "0" + minutes : minutes;
    seconds = (seconds < 10) ? "0" + seconds : seconds;
    var currentTime = hours + ":" + minutes + ":" + seconds;

    $textLarge.innerHTML = currentTime
    $textSmall.innerHTML = moment(now).format(' D MMMM YYYY ');
  }

  function renderValue($value, capabilityId, capabilityValue, capabilityUnits) {
    if (capabilityUnits == null) { capabilityUnits = "" }
    if (capabilityUnits == "W/m^2") { capabilityUnits = "W/m²" }
    if (capabilityValue == null) { capabilityValue = "-" }
    if (capabilityId == "measure_temperature" ||
      capabilityId == "target_temperature" ||
      capabilityId == "measure_humidity"
    ) {
      capabilityValue = Math.round(capabilityValue * 10) / 10
      var integer = Math.floor(capabilityValue)
      n = Math.abs(capabilityValue)
      var decimal = Math.round((n - Math.floor(n)) * 10) / 10 + "-"
      var decimal = decimal.substring(2, 3)

      $value.innerHTML = integer + "<span id='decimal'>" + decimal + capabilityUnits.substring(0, 1) + "</span>"
    } else if (capabilityId == "measure_pressure") {
      $value.innerHTML = Math.round(capabilityValue) + "<br /><sup>" + capabilityUnits + "</sup>"
    } else if (capabilityId == "dim" || capabilityId == "volume_set") {
      $value.innerHTML = Math.round(capabilityValue * 100) + "<br /><sup>" + capabilityUnits + "</sup>"
    } else {
      $value.innerHTML = capabilityValue + "<br /><sup>" + capabilityUnits + "</sup>"
    }
  }

  function renderName(device, elementToShow) {
    nameElement = document.getElementById('name:' + device.id)
    deviceElement = document.getElementById('device:' + device.id)
    if (!nameChange) {
      currentName = nameElement.innerHTML;
    }
    nameChange = true;
    nameElement.classList.add('highlight')
    nameElement.innerHTML = elementToShow.title
    setTimeout(function () {
      nameChange = false;
      nameElement.innerHTML = currentName
      nameElement.classList.remove('highlight')
      deviceElement.classList.remove('push-long')
    }, 1000);
  }

  function setBrightness(brightness) {
    brightness = brightness / 100
    //if ( brightness < 0.01) { brightness = 0.01}
    $container.style.opacity = brightness
    var style = styleElem.innerHTML
    oldStyle = style.split(";")
    newStyle = ""
    for (i = 0; i < 9; i++) {
      newStyle = newStyle + oldStyle[i] + ";"
    }
    var backgroundOpacity = getCookie('backgroundopacity')
    var newOpacity = backgroundOpacity * brightness
    //if ( newOpacity < 0.01 ) { newOpacity = 0.01 }
    newStyle = newStyle + " opacity: " + newOpacity + ";}"
    styleElem.innerHTML = newStyle
  }

  function selectValue(device, elementToShow) {
    for (item in device.capabilitiesObj) {
      capability = device.capabilitiesObj[item]
      if (capability.type == "number") {
        searchElement = document.getElementById('value:' + device.id + ':' + capability.id)
        if (searchElement.classList.contains('visible')) {
          searchElement.classList.remove('visible')
          searchElement.classList.add('hidden')
        }
      }
    }
    elementToShow.classList.remove('hidden')
    elementToShow.classList.add('visible')
    renderName(device, elementToShow)
  }

  function selectIcon($value, searchFor, device, capability) {
    // measure_uv and measure_solarradiation icons are broken at icons-cdn.athom.com
    if (capability.iconObj && capability.id != "measure_uv" && capability.id != "measure_solarradiation") {
      iconToShow = 'https://icons-cdn.athom.com/' + capability.iconObj.id + '-128.png'
    } else {
      iconToShow = 'img/capabilities/' + capability.id + '.png'
    }
    if (device.name == "Bier") { iconToShow = 'img/capabilities/tap.png' }
    $icon = document.getElementById('icon:' + device.id);
    $iconcapability = document.getElementById('icon-capability:' + device.id);
    if ($value.id == searchFor) {
      $value.classList.add('visible')
      $icon.style.opacity = 0.1
      if (device.name == "Bier" || device.name == "Bier temperatuur") { $icon.style.opacity = 0.5 }
      $iconcapability.style.webkitMaskImage = 'url(' + iconToShow + ')';
      $iconcapability.style.visibility = 'visible';
    } else {
      $value.classList.add('hidden')
    }
  }

  function renderSettingsPanel() {
    $sliderpanel.style.display = "none"
    if (!$settingsiframe) {
      var $settingsiframe = document.createElement('iframe')
      $settingsiframe.id = "settings-iframe"
      $settingsiframe.src = "./settings.html"
      $settingspanel.appendChild($settingsiframe)
    }

    var $buttonssettings = document.createElement('div')
    $buttonssettings.id = "buttons-settings"
    $settingspanel.appendChild($buttonssettings)

    var $savesettings = document.createElement('a')
    $savesettings.id = "save-settings"
    $savesettings.classList.add("btn")
    $buttonssettings.appendChild($savesettings)
    $savesettings.innerHTML = "save"

    var $cancelsettings = document.createElement('a')
    $cancelsettings.id = "save-settings"
    $cancelsettings.classList.add("btn")
    $buttonssettings.appendChild($cancelsettings)
    $cancelsettings.innerHTML = "cancel"

    $savesettings.addEventListener('click', function () {
      saveSettings();
    })

    $cancelsettings.addEventListener('click', function () {
      cancelsettings();
    })

    $settingspanel.style.visibility = "visible"

    $containerinner.classList.add('container-dark');
  }

  function saveSettings() {
    if (iframesettings.urllogoerror) {
      alert(texts.settings.errors.logo)
      return
    }
    if (iframesettings.urlbackgrounderror) {
      alert(texts.settings.errors.background)
      return
    }
    if (iframesettings.urlbackground != undefined) {
      setCookie("background", iframesettings.urlbackground, 12)
      setCookie('backgroundopacity', iframesettings.opacitybackground, 12)
      setCookie('backgroundcolor', "black", 12)
    } else {
      setCookie("background", "", 12)
      setCookie('backgroundopacity', "", 12)
      setCookie('backgroundcolor', "", 12)
    }
    if (iframesettings.urllogo != undefined) {
      setCookie("logo", iframesettings.urllogo, 12)
    } else {
      setCookie("logo", "", 12)
    }
    setCookie("outdoortemperature", iframesettings.newoutdoortemperature, 12)
    setCookie("indoortemperature", iframesettings.newindoortemperature, 12)
    setCookie("homeydashdevicebrightness", iframesettings.newhomeydashdevicebrightness, 12)
    setCookie("showtime", iframesettings.newshowTime, 12)
    setCookie("darkmode", iframesettings.newdarkmode, 12)
    setCookie("zoom", iframesettings.newZoom, 12)
    setCookie("order", iframesettings.neworder, 12)
    location.assign(location.protocol + "//" + location.host + location.pathname + "?theme=" + iframesettings.newtheme + "&lang=" + iframesettings.newlanguage + "&token=" + iframesettings.token + "&background=" + encodeURIComponent(iframesettings.urlbackground) + "&logo=" + encodeURIComponent(iframesettings.urllogo))
  }

  function cancelsettings() {
    var $settingsiframe = document.createElement('iframe')
    $settingspanel.style.visibility = "hidden"
    $containerinner.classList.remove('container-dark');

    $settingspanel.removeChild($settingsiframe)
    $settingsiframe = null
    location.reload(true)
  }

  function showSecondary(device, event) {
    var showSlider = false
    var xpos
    try {
      //xpos = event.touches[0].clientX
      xpos = Math.round(25 + (parseInt((event.touches[0].clientX - 25) / (163 * zoom)) * (163 * zoom)))
    }
    catch (err) {
      if (theme == "web") {
        xpos = event.clientX - event.offsetX
      } else {
        xpos = Math.round(25 + (parseInt((event.clientX - 25) / (163 * zoom)) * (163 * zoom)))
      }
      /*
      console.log( event.clientX - event.offsetX )
      console.log( event.clientX )
      console.log( zoom )
      console.log( (event.clientX-25)/163/zoom )
      console.log( parseInt((event.clientX-25)/(163*zoom)) )
      console.log( Math.round( 25 + ( parseInt((event.clientX-25)/(163*zoom) ) * (163*zoom) ) ) )
      */
    }

    var newX = xpos + (150 * zoom) + 5
    if (newX + window.innerWidth * 0.35 > window.innerWidth) {
      var newX = (xpos - (0.35 * window.innerWidth)) - 13
    }

    $sliderpanel.style.left = newX + "px"
    $slidericon.style.webkitMaskImage = 'url(https://icons-cdn.athom.com/' + device.iconObj.id + '-128.png)';
    $slidername.innerHTML = device.name

    if (device.capabilitiesObj && device.capabilitiesObj.dim || device.capabilitiesObj && device.capabilitiesObj.volume_set) {
      $slider.min = 0
      $slider.max = 100
      $slider.step = 1
      sliderUnit = " %"
      if (device.capabilitiesObj.dim) {
        $slidercapability.style.webkitMaskImage = 'url(img/capabilities/dim.png)';
        $slider.value = device.capabilitiesObj.dim.value * 100
      } else if (device.capabilitiesObj.volume_set) {
        $slidercapability.style.webkitMaskImage = 'url(img/capabilities/volume_set.png)';
        $slider.value = device.capabilitiesObj.volume_set.value * 100
      }
      $slidervalue.innerHTML = $slider.value + sliderUnit
      showSlider = true
    } else if (device.capabilitiesObj && device.capabilitiesObj.target_temperature) {
      $slider.min = device.capabilitiesObj.target_temperature.min
      $slider.max = device.capabilitiesObj.target_temperature.max
      $slider.step = device.capabilitiesObj.target_temperature.step
      $slidercapability.style.webkitMaskImage = 'url(img/capabilities/target_temperature.png)';
      sliderUnit = "°"
      $slider.value = device.capabilitiesObj.target_temperature.value
      $slidervalue.innerHTML = $slider.value + sliderUnit
      showSlider = true
    }
    if (showSlider) {
      $sliderpanel.style.display = "block"
      selectedDevice = device
    }
  }

  function hideSecondary() {
    $sliderpanel.style.display = "none"

  }

  $slider.oninput = function () {
    $slidervalue.innerHTML = $slider.value + sliderUnit
    if (slideDebounce) { return }
    slideDebounce = true
    var newCapabilityValue
    var newCapabilityId
    setTimeout(function () {
      if (selectedDevice.capabilitiesObj && selectedDevice.capabilitiesObj.dim) {
        newCapabilityId = 'dim'
        newCapabilityValue = ($slider.value / 100)
      } else if (selectedDevice.capabilitiesObj && selectedDevice.capabilitiesObj.volume_set) {
        newCapabilityId = 'volume_set'
        newCapabilityValue = ($slider.value / 100)
      } else if (selectedDevice.capabilitiesObj && selectedDevice.capabilitiesObj.target_temperature) {
        newCapabilityId = 'target_temperature'
        newCapabilityValue = ($slider.value / 1)
      }
      //console.log(newCapabilityId)
      homey.devices.setCapabilityValue({
        deviceId: selectedDevice.id,
        capabilityId: newCapabilityId,
        value: newCapabilityValue,
      }).catch(console.error);
      slideDebounce = false
    }, 200)

  }

  function valueCycle(device) {
    var itemMax = 0
    var itemNr = 0
    var showElement = 0
    for (item in device.capabilitiesObj) {
      capability = device.capabilitiesObj[item]
      if (capability.type == "number") {
        itemMax = itemMax + 1
      }
    }
    for (item in device.capabilitiesObj) {
      capability = device.capabilitiesObj[item]
      if (capability.type == "number") {
        if (
          capability.id == "light_temperature" ||
          capability.id == "light_saturation" ||
          capability.id == "light_hue"
        ) {
          continue;
        }
        searchElement = document.getElementById('value:' + device.id + ':' + capability.id)
        if (itemNr == showElement) {
          elementToShow = searchElement
          capabilityToShow = capability.id
          // measure_uv and measure_solarradiation icons are broken at icons-cdn.athom.com
          if (capability.iconObj && capability.id != "measure_uv" && capability.id != "measure_solarradiation") {
            iconToShow = 'https://icons-cdn.athom.com/' + capability.iconObj.id + '-128.png'

          } else {
            iconToShow = 'img/capabilities/' + capability.id + '.png'
          }
          if (device.name == "Bier") { iconToShow = 'img/capabilities/tap.png' }
          itemNrVisible = itemNr
        }
        if (searchElement.classList.contains('visible')) {
          searchElement.classList.remove('visible')
          searchElement.classList.add('hidden')
          currentElement = itemNr
          showElement = itemNr + 1
        }
        itemNr = itemNr + 1
      }
    }
    $icon = document.getElementById('icon:' + device.id);
    $iconcapability = document.getElementById('icon-capability:' + device.id);
    if (showElement != itemNr) {
      elementToShow.classList.remove('hidden')
      elementToShow.classList.add('visible')
      renderName(device, elementToShow)
      setCookie(device.id, elementToShow.id, 12)
      $icon.style.opacity = 0.1
      if (device.name == "Bier" || device.name == "Bier temperatuur") { $icon.style.opacity = .5 }
      $iconcapability.style.webkitMaskImage = 'url(' + iconToShow + ')';
      $iconcapability.style.visibility = 'visible';
    } else {
      setCookie(device.id, "-", 12)
      $icon.style.opacity = 1
      $iconcapability.style.visibility = 'hidden';
      deviceElement = document.getElementById('device:' + device.id)
      nameChange = true;
      setTimeout(function () {
        nameChange = false;
        deviceElement.classList.remove('push-long')
      }, 1000);
    }
  }

  function calculateTOD() {
    var d = new Date();
    var m = d.getMinutes();
    var h = d.getHours();
    if (h == '0') { h = 24 }

    var currentTime = h + "." + m;
    var time = sunrise.split(":");
    var hour = time[0];
    if (hour == '00') { hour = 24 }
    var min = time[1];
    var sunriseTime = hour + "." + min;

    var time = sunset.split(":");
    var hour = time[0];
    if (hour == '00') { hour = 24 }
    var min = time[1];
    var sunsetTime = hour + "." + min;

    if (parseFloat(currentTime, 10) < parseFloat(sunriseTime, 10)) {
      tod = 1;
      dn = "n";
    }
    else if (parseFloat(currentTime, 10) < parseFloat(sunsetTime, 10)) {
      tod = 2;
      dn = "";
    } else {
      tod = 3;
      dn = "n";
    }
  }
});