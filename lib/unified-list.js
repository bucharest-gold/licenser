'use strict';

const unifiedList = require('./resources/default-unified-list.json');

// checks the licenses found against properties of approved list
// to verify if the license name is found.
function findApproved (approvedList, licensesFound) {
  const approvedFound = new Set();
  approvedList.forEach((a) => {
    licensesFound.forEach((lf) => {
      if (lf.license === a['fedora_abbrev'] ||
        lf.license === a['fedora_name'] ||
        lf.license === a['spdx_abbrev'] ||
        lf.license === a['spdx_name']) {
        approvedFound.add(lf);
      }
    });
  });
  return approvedFound;
}

// checks the licenses found against properties of not approved list
// to verify if the license name is found.
function findNotApproved (notApprovedList, licensesFound) {
  const notApprovedFound = new Set();
  notApprovedList.forEach((a) => {
    licensesFound.forEach((lf) => {
      if (lf.license === a['fedora_abbrev'] ||
        lf.license === a['fedora_name'] ||
        lf.license === a['spdx_abbrev'] ||
        lf.license === a['spdx_name'] ||
        lf.license.indexOf('*') === lf.license.length - 1) {
        notApprovedFound.add(lf);
      }
    });
  });
  return notApprovedFound;
}

function printApproved (approved) {
  if (approved.size > 0) {
    console.log(`========= APPROVED LICENSES        ==========`);
    Array.from(approved).forEach((license) => {
      console.log('name:', license.name,
           ', version:', license.version,
           ', licenses:', license.license);
    });
    console.log(`========= APPROVED LICENSES        ==========`);
  }
}

function printNotApproved (notApproved) {
  if (notApproved.size > 0) {
    console.log(`========= NOT APPROVED LICENSES    ==========`);
    Array.from(notApproved).forEach((license) => {
      console.log('name:', license.name,
           ', version:', license.version,
           ', licenses:', license.license);
    });
    console.log(`========= NOT APPROVED LICENSES    ==========`);
  }
}

// gets the licenses found in the following format:
// [{ name: 'roi', version: '0.15.0', license: 'Apache-2.0' }]
function getLicensesFromXmlObject (xmlObject) {
  const licensesFound = xmlObject.dependencies.dependency.map((dep) => {
    const licenseNames = dep.licenses.license.map((license) => {
      return license.name;
    }).join();
    return { name: dep.packageName, version: dep.version, license: licenseNames };
  });
  return licensesFound;
}

function check (xmlObject) {
  const licensesFound = getLicensesFromXmlObject(xmlObject);

  // gets the approved and not approved licenses from the default unified list.
  const approvedList = [];
  const notApprovedList = [];
  Object.keys(unifiedList).forEach(key => {
    if (unifiedList[key].approved === 'yes') {
      approvedList.push(unifiedList[key]);
    } else {
      notApprovedList.push(unifiedList[key]);
    }
  });

  const approvedFound = findApproved(approvedList, licensesFound);
  const notApprovedFound = findNotApproved(notApprovedList, licensesFound);
  printApproved(approvedFound);
  printNotApproved(notApprovedFound);
}

function urlForName (name) {
  if (name.indexOf(',') !== -1) {
    return name.split(',').map((name) => {
      return _urlForName(name.trim());
    }).join(', ');
  }
  return _urlForName(name);
}

function _urlForName (name) {
  if (name === 'UNKNOWN') {
    return name;
  }
  if (unifiedList[name]) {
    return unifiedList[name].url;
  }
  console.error(`No URL was found for [${name}]`);
  return 'UNKNOWN';
}

module.exports = {
  check: check,
  urlForName: urlForName
};
