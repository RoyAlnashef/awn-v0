/** Inline boot script — iOS inset floor lives in globals.css (html.capacitor-native-ios). */
export const CAPACITOR_SAFE_AREA_BOOT_SCRIPT = `(function(){try{
function isCapAppIos(){
  var ua=navigator.userAgent||"";
  var ios=/iPhone|iPad|iPod/i.test(ua);
  if(!ios)return false;
  var c=window.Capacitor;
  if(c&&c.isNativePlatform&&c.isNativePlatform()&&c.getPlatform&&c.getPlatform()==="ios")return true;
  return ua.indexOf("Capacitor")>-1||ua.indexOf("CapacitorAWN")>-1;
}
function markNativeShell(){
  if(!isCapAppIos())return;
  document.documentElement.classList.add("capacitor-native","capacitor-native-ios");
  document.documentElement.style.removeProperty("--site-header-inset-top");
  document.documentElement.style.removeProperty("--safe-area-inset-bottom");
}
function sync(){
  markNativeShell();
  if(isCapAppIos())return;
  var c=window.Capacitor;
  if(!c||!c.isNativePlatform||!c.isNativePlatform())return;
  document.documentElement.classList.add("capacitor-native");
  function m(p){
    var d=document.createElement("div");
    d.style.cssText="position:fixed;visibility:hidden;"+p;
    document.documentElement.appendChild(d);
    var s=getComputedStyle(d);
    var v=p.indexOf("padding-top")===0?parseFloat(s.paddingTop)||0:parseFloat(s.paddingBottom)||0;
    d.remove();
    return v;
  }
  var top=m("padding-top:env(safe-area-inset-top,0px)");
  var bottom=m("padding-bottom:env(safe-area-inset-bottom,0px)");
  document.documentElement.style.setProperty("--site-header-inset-top",top+"px");
  document.documentElement.style.setProperty("--safe-area-inset-bottom",bottom+"px");
}
markNativeShell();
sync();
document.addEventListener("DOMContentLoaded",function(){markNativeShell();sync();});
[0,50,100,250,500,1000,2000,3000].forEach(function(ms){setTimeout(function(){markNativeShell();sync();},ms);});
}catch(e){}})();`
