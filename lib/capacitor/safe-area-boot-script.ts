import {
  CAPACITOR_IOS_BOTTOM_INSET_PX,
  CAPACITOR_IOS_MAX_HEADER_INSET_PX,
} from "@/lib/capacitor/ios-native-inset-px"

/** Inline boot script — keep max/bottom constants in sync with ios-native-inset-px.ts. */
export const CAPACITOR_SAFE_AREA_BOOT_SCRIPT = `(function(){try{
var MAX_TOP=${CAPACITOR_IOS_MAX_HEADER_INSET_PX};
var BOTTOM=${CAPACITOR_IOS_BOTTOM_INSET_PX};
function isCapAppIos(){
  var ua=navigator.userAgent||"";
  var ios=/iPhone|iPad|iPod/i.test(ua);
  if(!ios)return false;
  var c=window.Capacitor;
  if(c&&c.isNativePlatform&&c.isNativePlatform()&&c.getPlatform&&c.getPlatform()==="ios")return true;
  return ua.indexOf("Capacitor")>-1||ua.indexOf("CapacitorAWN")>-1;
}
function resolveTop(){
  var header=document.querySelector('[data-slot="site-header"]');
  var anchorTop=header?header.getBoundingClientRect().top:document.documentElement.getBoundingClientRect().top;
  return Math.min(MAX_TOP,Math.max(0,Math.round(-anchorTop)));
}
function applyIosInsets(){
  if(!isCapAppIos())return;
  document.documentElement.classList.add("capacitor-native","capacitor-native-ios");
  var top=resolveTop();
  if(top<=0){
    document.documentElement.style.removeProperty("--site-header-inset-top");
  }else{
    document.documentElement.style.setProperty("--site-header-inset-top",top+"px");
  }
  document.documentElement.style.setProperty("--safe-area-inset-bottom",BOTTOM+"px");
}
function syncAndroid(){
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
function run(){applyIosInsets();syncAndroid();}
run();
document.addEventListener("DOMContentLoaded",run);
[0,50,100,250,500,1000,2000,3000].forEach(function(ms){setTimeout(run,ms);});
}catch(e){}})();`
