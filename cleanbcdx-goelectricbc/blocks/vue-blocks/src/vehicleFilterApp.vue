<template>
  <h3 id="vehicleGridHeading" class="mb-2 d-none d-md-block">Find a vehicle <span v-if="vehicles.length">({{ ariaLiveMessage }})</span> <span v-else>(no vehicles currently available)</span>
  </h3>
  <p id="vehicleGridDescription" class="sr-only" v-if="true">A grid of available vehicles filtered by selected options.</p>
  <span aria-live='assertive' class='sr-only'>Find a vehicle is showing {{ ariaLiveMessage }}</span>
  <div class="container-fluid flex-container" v-if="vehicles.length">
    <div id="vue-app" class="row scrollable">
      <div class="filter-container filter-container-desktop d-none d-md-block">
        <div class="filter-flex-container">
          <div class="flex-group input-field-group">
            <h4 id="make-header-mobile">By make, model or year</h4>
            <div class="mb-2"><input type="text" v-model="filterValue" class="form-control"
                placeholder="filter by name..."
                aria-label="enter a vehicle make or model to filter the options below" /></div>
            <p class="msrp-link text-dark">...or by EV type eg: BEV or PHEV</p>
          </div>
          <div class="flex-group price-range-group">
            <h4>Price Range</h4>
            <vue-slider ref="slider" v-model="rangeValue" v-bind="rangeOptions" tabindex="0"
              aria-label="This slider allows you to set a minimum and maximum price range – the low end begins at the minimum amount of 28,000 and the high end is set to the maximum amount of 70,000"></vue-slider>
              <p class="msrp-range" aria-live='polite'>${{ rangeValue[0] | addComma }} <span class='sr-only'>minimum price to </span><span class="max-msrp">${{ rangeValue[1] |
    addComma }}<span class='sr-only'>maximum price</span></span></p>
                <details class="wp-block-details has-gray-80-color has-text-color has-link-color is-layout-flow wp-block-details-is-layout-flow" style="text-align: left;font-size:clamp(0.875rem, 0.875rem + ((1vw - 0.2rem) * 0.036), 0.9rem);"><summary>Price range as shown is based on
                  automaker <nobr>MSRP<sup> *</sup></nobr></summary>
                  <div class="wp-block-group is-layout-flow wp-block-group-is-layout-flow">
                    <p>* Automakers provide a manufacturer's suggested retail price (MSRP) when they apply to make their vehicles eligible for rebates. MSRPs listed do not include any fees that are part of the sale of a vehicle. They also do not include the cost of any optional accessories. Vehicle prices change often. Refer to automaker or dealer website for up-to-date prices. Vehicle information is about the most recent model listed. Other model years may vary.</p>
                  </div>
                </details>
                
          </div>
          <div class="flex-group sort-by-group">
            <div class="flex-group-filters">
              <h4 style='margin-bottom: 0.25rem;'>Sort by</h4>
              <div class="btn-group-horizontal" role="group">
                <button type="button" class="btn btn-default btn-33" 
                  :class="{ active: isMake }" 
                  :aria-pressed="isMake"
                  @click="changeOrder('make')" aria-label="sort available vehicles by Make">Make</button>
                <button type="button" class="btn btn-default btn-33" 
                  :class="{ active: isModel }" 
                  :aria-pressed="isModel"
                  @click="changeOrder('model')" aria-label="sort available vehicles by Model">Model</button>
                <button type="button" class="btn btn-default btn-33" 
                  :class="{ active: isYear }" 
                  :aria-pressed="isYear"
                  @click="changeOrder('year')" aria-label="sort available vehicles by Year">Year</button>
              </div>
              <div class="btn-group-horizontal" role="group">
                <button type="button" class="btn btn-default btn-33" 
                  :class="{ active: isType }" 
                  :aria-pressed="isType"
                  @click="changeOrder('type')" aria-label="sort available vehicles by Type">EV Type</button>
                <button type="button" class="btn btn-default btn-33" 
                  :class="{ active: isMSRP }" 
                  :aria-pressed="isMSRP"
                  @click="changeOrder('msrp')" aria-label="sort available vehicles by MSRP">MSRP<sup> *</sup></button>
                <button type="button" class="btn btn-default btn-33" 
                  :class="{ active: isRebate }" 
                  :aria-pressed="isRebate"
                  @click="changeOrder('rebate')" aria-label="sort vehicles by Rebate">Rebate Amt.</button>
              </div>
              <div class="btn-group-horizontal" role="group">
                <button type="button" class="btn btn-default btn-50" 
                  :class="{ active: isElectricRange }" 
                  :aria-pressed="isElectricRange"
                  @click="changeOrder('rangeElectric')" aria-label="sort vehicles by Electric Range">Elec.
                  Range</button>
                <button type="button" class="btn btn-default btn-50" 
                  :class="{ active: isFullRange }" 
                  :aria-pressed="isFullRange"
                  @click="changeOrder('rangeFull')" aria-label="sort vehicles by Full Range">Full Range</button>
              </div>
            </div>
          </div>
          <div class="flex-group d-none d-lg-block type-key-group">
            <h4>Available EV Types</h4>
            <p class="type-key"><span v-if='vehicleTypes && vehicleTypes.includes("BEV")'><span><strong>B<span class="sr-only">.</span>E<span class="sr-only">.</span>V<span class="sr-only">.</span></strong></span> – Battery Electric Vehicle<br /></span>
              <span v-if='vehicleTypes && vehicleTypes.includes("ER-EV")'><span><strong>E<span class="sr-only">.</span>R<span class="sr-only">.</span>-E<span class="sr-only">.</span>V<span class="sr-only">.</span></strong></span> – Extended Range EV<br /></span>
              <span v-if='vehicleTypes && vehicleTypes.includes("FCEV")'><span><strong>F<span class="sr-only">.</span>C<span class="sr-only">.</span>E<span class="sr-only">.</span>V<span class="sr-only">.</span></strong></span> – Fuel Cell Electric Vehicle<br /></span>
              <span v-if='vehicleTypes && vehicleTypes.includes("PHEV")'><span><strong>P<span class="sr-only">.</span>H<span class="sr-only">.</span>E<span class="sr-only">.</span>V<span class="sr-only">.</span></strong></span> – Plug-in Hybrid EV<br /></span>
            </p>
          </div>
        </div>
        <h4 class="type-key d-none d-md-block d-lg-none text-center">Available EV Types:<br />
          <span class="mt-2 d-block">
            <nobr v-if='vehicleTypes && vehicleTypes.includes("BEV")'><strong>BEV</strong> – Battery Electric Vehicle | </nobr>
            <nobr v-if='vehicleTypes && vehicleTypes.includes("ER-EV")'><strong>ER-EV</strong> – Extended Range EV | </nobr>
            <nobr v-if='vehicleTypes && vehicleTypes.includes("FCEV")'><strong>FCEV</strong> – Fuel Cell Electric Vehicle | </nobr>
            <nobr v-if='vehicleTypes && vehicleTypes.includes("PHEV")'><strong>PHEV</strong> – Plug-in Hybrid EV</nobr>
          </span>
        </h4>
      </div>
      <div class="filter-container filter-container-mobile d-sm-block d-md-none">
        <p><img class="logo-img img-fluid" :src="cleanBCLogo" alt="CleanBC Go electric" /></p>
        <h3 class="mt-3" aria-live='polite'>Find a vehicle <span v-if="vehicles.length !== undefined">(<span class='sr-only'>showing</span>{{
    searchvehicles.length }} of {{ vehicles.length }})</span> <span v-else>(no vehicles currently available)</span> 
        </h3>
        <h4 id="make-header">By make or model or type</h4>
        <p class="mb-2"><input type="text" v-model="filterValue" class="form-control" placeholder="filter by name..."
            aria-label="enter a vehicle make or model to filter the options below" /></p>
        <p class="msrp-link text-dark">...or by EV type eg: BEV or PHEV</p>
        <div class="filter-flex-container">
          <div class="flex-group">
            <h4>MSRP Range</h4>
            <div class="msrp-range-slider">
              <vue-slider ref="slider" v-model="rangeValue" v-bind="rangeOptions"></vue-slider>
              <p class="msrp-range" aria-live='polite'>${{ rangeValue[0] | addComma }} <span class='sr-only'>minimum price to </span> <span aria-hidden='true'>–</span> <span class="max-msrp">${{ rangeValue[1] |
    addComma }}<span class='sr-only'>maximum price</span></span></p>
            </div>
            <p class="msrp-link"><a href="#disclaimer"
                aria-label="navigate to the M.S.R.P. disclaimer information">Price
                range as shown is based on automaker <nobr>MSRP<sup> *</sup></nobr></a></p>
          </div>
          <div class="flex-group">
            <div class="flex-group-filters">
              <div class="btn-group-horizontal" role="group">
                <span class="filter-header">Sort by &rtrif;</span>
                <button type="button" class="btn btn-default" :class="{ active: isMake }" @click="changeOrder('make')"
                  aria-label="sort vehicles by Make">Make</button>
                <button type="button" class="btn btn-default" :class="{ active: isModel }" @click="changeOrder('model')"
                  aria-label="sort vehicles by Model">Model</button>
              </div>
              <div class="btn-group-horizontal" role="group">
                <span class="filter-header">Value &rtrif;</span>
                <button type="button" class="btn btn-default" :class="{ active: isMSRP }" @click="changeOrder('msrp')"
                  aria-label="sort vehicles by MSRP">MSRP<sup> *</sup></button>
                <button type="button" class="btn btn-default" :class="{ active: isRebate }"
                  @click="changeOrder('rebate')" aria-label="sort vehicles by Rebate">Rebate Amt.</button>
              </div>
              <div class="btn-group-horizontal" role="group">
                <span class="filter-header">Range &rtrif;</span>
                <button type="button" class="btn btn-default" :class="{ active: isElectricRange }"
                  @click="changeOrder('rangeElectric')" aria-label="sort vehicles by Electric Range">Electric</button>
                <button type="button" class="btn btn-default" :class="{ active: isFullRange }"
                  @click="changeOrder('rangeFull')" aria-label="sort vehicles by Full Range">Full</button>
              </div>
              <div class="btn-group-horizontal" role="group">
                <span class="filter-header">Style &rtrif;</span>
                <button type="button" class="btn btn-default" :class="{ active: isType }" @click="changeOrder('type')"
                  aria-label="sort vehicles by Type">EV Type</button>
                  <button type="button" class="btn btn-default" :class="{ active: isYear }" @click="changeOrder('year')"
                  aria-label="sort vehicles by Type">Year</button>
              </div>
            </div>
          </div>
          <p class="type-key hidden-lg hidden-md">Available EV Types <br />
            <span v-if='vehicleTypes && vehicleTypes.includes("BEV")'>
              <nobr><strong>BEV</strong> – Battery Electric Vehicle</nobr> <br />
            </span>
            <span v-if='vehicleTypes && vehicleTypes.includes("ER-EV")'>
              <nobr><strong>ER-EV</strong> – Extended Range EV</nobr><br />
            </span>
            <span v-if='vehicleTypes && vehicleTypes.includes("FCEV")'>
              <nobr><strong>FCEV</strong> – Fuel Cell Electric Vehicle</nobr> <br />
            </span>
            <span v-if='vehicleTypes && vehicleTypes.includes("PHEV")'>
              <nobr><strong>PHEV</strong> – Plug-in Hybrid EV</nobr>
            </span>
          </p>
        </div>
      </div>
      <div role="grid" aria-labelledby="vehicleGridDescription" :data-column-count="columnCount" :aria-colcount="columnCount" :aria-rowcount="Math.ceil(searchvehicles.length / columnCount)" style='display: contents;'>
      <div role="row"  style='display: contents;'>
        <template v-if="searchvehicles.length > 0" v-for="(vehicle, index) in searchvehicles">
        <div  class="vehicle-details" 
              role="gridcell" 
              :tabindex="index === focusedCellIndex ? 0 : -1"
              @keydown="onGridKeydown($event, index)"
              @focus="focusedCellIndex = index" 
              :aria-label="'Vehicle ' + (index + 1) + ' of ' + searchvehicles.length + '. Make: ' + vehicle.make + '. Model: ' + vehicle.model + '.'"
              :data-additional-info="'Price starts at: $' + vehicle.minMsrp  + '. Electric Range: ' + vehicle.rangeElectricKm + ' kilometers. Vehicle rebates up to: $' 
                + ( isFederalRebate ? vehicle.rebate_provincial + vehicle.rebate_federal : vehicle.rebate_provincial ).toLocaleString() + '.' ">
          <div>
            <div class="ev-img"><img class="img-fluid" :src="vehicle.image ? vehicle.image : placeholderImg"
                :alt="'photo of a ' + vehicle.make + ' ' + vehicle.model" /></div>
            <p style='margin-bottom: 1rem;'><span class="highlight vehicle-make-container" :data-make='vehicle.make'> {{ vehicle.make }}</span> <span class='divider-container'><strong>|</strong></span> <span class='vehicle-type-container' :data-type='vehicle.type'><strong>{{ vehicle.type }}</strong></span>
              <span class="model vehicle-model-container" :data-model='vehicle.model'>{{ vehicle.model }}</span>
              <span class="year vehicle-year-container" :data-year='20 + vehicle.year.map(year => year - 2000).join("/")' v-if='0 !== vehicle.year.length' style='margin-top: 0;'>20{{ vehicle.year.map(year => year - 2000).join('/') }}</span>
              <span v-if="vehicle.maxMsrp === 0" class="msrp vehicle-msrp-container" :data-msrp='"$" + vehicle.minMsrp.toLocaleString()'><strong>MSRP<sup v-if="index === 0"> *</sup> ${{ vehicle.minMsrp.toLocaleString() }}</strong></span>
              <span v-else class="msrp vehicle-msrp-container" :data-msrp-range='"$" + vehicle.minMsrp.toLocaleString() + "-$" + vehicle.maxMsrp.toLocaleString()'><strong>MSRP<sup v-if="index === 0">*</sup>: ${{ vehicle.minMsrp.toLocaleString() }}–${{ vehicle.maxMsrp.toLocaleString() }}</strong></span>
              <hr class="hr" size="1" />
              <span class="d-block heading-range"><strong>Range:</strong></span>
              <span class="d-block mt-2 mb-1 range-electric">{{ vehicle.rangeElectricKm.toLocaleString() }}km Electric</span>
              <span v-if="vehicle.rangeFullKm !== 0" class="d-block range-full">{{ vehicle.rangeFullKm.toLocaleString() }}km Full</span>
              <span v-if="vehicle.rangeFullKm === 0" class="d-block range-full">{{ vehicle.rangeElectricKm }}km Full</span>
              <span v-if="false" class="d-block mt-2 mb-1 vehicle-type">Type:
                <span v-if="vehicle.type === 'BEV'">Battery Electric Vehicle</span>
                <span v-if="vehicle.type === 'ER-EV'">Extended Range EV</span>
                <span v-if="vehicle.type === 'FCEV'">Fuel Cell Electric Vehicle</span>
                <span v-if="vehicle.type === 'PHEV'">Plug-in Hybrid EV</span>
              </span>
              <template v-if='isFederalRebate'>
                <span v-if="false" class="d-block vehicle-class">Class: {{ vehicle.vehicle_class }}</span>
                <hr class="hr" size="1" />
                <span class="d-block heading-rebates"><strong>Rebates up to:</strong></span>
                <span v-if="vehicle.rebate_provincial !== 0" class="d-block mt-2 mb-1 rebate-provincial">${{ vehicle.rebate_provincial.toLocaleString() }} Provincial</span>
                <span v-else class="d-block mt-2 mb-1 rebate-provincial">No Provincial rebate</span>
                <span v-if="isFederalRebate && vehicle.rebate_federal !== 0 && vehicle.rebate_federal_status === 'processed'" class="d-block rebate-federal">${{ vehicle.rebate_federal.toLocaleString() }} Federal</span>
                <span v-else-if="vehicle.rebate_federal_status === 'pending'" class="d-block rebate-federal">Federal rebate pending</span>
                <span v-else-if='isFederalRebate' class="d-block rebate-federal">No Federal rebate</span>
              </template>
              <hr class="hr" size="1" />
              <span class="d-block"><a class="accessibleFocusItem" :href="vehicle.url"
                  :aria-label="'Go to the ' + vehicle.make + ' ' + vehicle.model + ' website.'" :key="index">Visit manufacturer website <span aria-hidden="true" v-html="externalSVGImage" style="object-fit: contain;width: 16px;height: 16px;" ></span></a></span>
            </p>
            <p v-if="isFederalRebate && vehicle.rebate_federal_status === 'processed'" class="rebate-content">Combined rebates up to ${{ (vehicle.rebate_provincial + vehicle.rebate_federal).toLocaleString() }}</p>
            <p v-else-if='!isFederalRebate' class="rebate-content">Provincial rebate up&nbsp;to ${{ (vehicle.rebate_provincial).toLocaleString() }}
            </p>
          </div>
        </div>
      </template>
    </div>
      </div>
      <div class="vehicle-details" v-if='searchvehicles.length === 0'>
        <div class="no-content"><img :src="cleanBCLeaf" /></div>
        <h3 class="no-content">We're unable to find any Electric Vehicles that match your criteria</h3>
        <p class="no-content">Your filtering options did not return any results. Please try refining your input or
          parameters. Common issues include invalid makes or models, or too narrow a price range.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Vue component script for the Go Electric BC Vehicle Filter.
 */
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from 'vue';
import VueSlider from 'vue-slider-component';

const publicDomain = 'https://goelectricbc.goc.bc.ca';

const vehiclesAPI = `${window.site?.domain ? window.site.domain : publicDomain}/wp-json/custom/v1/vehicles`;

const vehicles = ref([]);
const vehicleTypes = ref([]);
const filterValue = ref('');
const focusedCellIndex = ref(0);
const priceAmount = ref(70000);
const isMake = ref(false);
const isType = ref('');
const isModel = ref(true);
const isMSRP = ref(false);
const isClass = ref(false);
const isRebate = ref(false);
const isFederalRebate = ref(false);
const isYear = ref(false);
const typeLabel = ref('');
const isElectricRange = ref(false);
const isFullRange = ref(false);
const rangeValue = ref([28000, 70000]);
const ariaLiveMessage = ref("");

const columnCount = ref(4); // default

let globalPluginDirFlag = false;
let cleanBCLogo = ref('');
let cleanBCLeaf = ref('');
let placeholderImg = ref('');

const rangeOptions = {
  dotSize: 24,
  width: 'auto',
  height: 4,
  contained: false,
  direction: 'ltr',
  data: null,
  min: 28000,
  max: 70000,
  interval: 500,
  disabled: false,
  clickable: true,
  duration: 0.5,
  adsorb: false,
  lazy: false,
  tooltip: 'focus',
  tooltipPlacement: 'top',
  tooltipFormatter: undefined,
  useKeyboard: true,
  enableCross: true,
  fixed: false,
  minRange: 5000,
  maxRange: 65000,
  order: true,
  marks: false,
  dotOptions: undefined,
  process: true,
  dotStyle: undefined,
  railStyle: undefined,
  processStyle: undefined,
  tooltipStyle: undefined,
  stepStyle: undefined,
  stepActiveStyle: undefined,
  labelStyle: undefined,
  labelActiveStyle: undefined,
};

const externalSVGImage = '<svg version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" viewBox="0 0 18 18" style="fill: #1d8045; object-fit: contain; width: 1rem; height: 1rem;" xml:space="preserve"><path d="M9.7,3.9c0-0.1-0.1-0.3-0.2-0.4C9.4,3.4,9.3,3.4,9.2,3.4H1.7c-0.4,0-0.9,0.2-1.2,0.5C0.2,4.2,0,4.6,0,5.1v11.2	c0,0.4,0.2,0.9,0.5,1.2C0.8,17.8,1.2,18,1.7,18h11.2c0.4,0,0.9-0.2,1.2-0.5c0.3-0.3,0.5-0.7,0.5-1.2V8.8c0-0.1-0.1-0.3-0.2-0.4 c-0.1-0.1-0.2-0.2-0.4-0.2c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4v7.5c0,0.1-0.1,0.3-0.2,0.4c-0.1,0.1-0.2,0.2-0.4,0.2	H1.7c-0.1,0-0.3-0.1-0.4-0.2c-0.1-0.1-0.2-0.2-0.2-0.4V5.1c0-0.1,0.1-0.3,0.2-0.4c0.1-0.1,0.2-0.2,0.4-0.2h7.5 c0.1,0,0.3-0.1,0.4-0.2C9.7,4.2,9.7,4.1,9.7,3.9z"/><path d="M18,0.6c0-0.1-0.1-0.3-0.2-0.4C17.7,0.1,17.6,0,17.4,0h-5.6c-0.1,0-0.3,0.1-0.4,0.2c-0.1,0.1-0.2,0.2-0.2,0.4 s0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.2,0.4,0.2h4.3l-9.2,9.2c-0.1,0.1-0.1,0.1-0.1,0.2c0,0.1,0,0.1,0,0.2s0,0.1,0,0.2 c0,0.1,0.1,0.1,0.1,0.2C7,11.1,7,11.2,7.1,11.2c0.1,0,0.1,0,0.2,0c0.1,0,0.1,0,0.2,0s0.1-0.1,0.2-0.1l9.2-9.2v4.3 c0,0.1,0.1,0.3,0.2,0.4c0.1,0.1,0.2,0.2,0.4,0.2c0.1,0,0.3-0.1,0.4-0.2C17.9,6.5,18,6.3,18,6.2V0.6z"/></svg>';

function handleResize() {
  const width = window.innerWidth;

  if (width <= 479) {
    columnCount.value = 1;  
  } else if (width <= 991) {
    columnCount.value = 2;
  } else if (width <= 1024) {
    columnCount.value = 3;
  } else {
    columnCount.value = 4;
  }
}

/**
 * Keydown handler. 
 * Moves focus among grid cells based on the key pressed.
 */
 function onGridKeydown(event, index) {
  const { key, ctrlKey } = event;
  let newIndex = focusedCellIndex.value;

  // Number of items in the grid
  const itemCount = searchvehicles.value.length;

  // Use columnCount.value for math
  const cols = columnCount.value;

  const row = Math.floor(index / cols);
  const col = index % cols;
  const maxRow = Math.floor((itemCount - 1) / cols);

  switch (key) {
    case 'ArrowRight':
      event.preventDefault();
      if (col < cols - 1 && newIndex < itemCount - 1) {
        newIndex = index + 1;
      }
      break;

    case 'ArrowLeft':
      event.preventDefault();
      if (col > 0) {
        newIndex = index - 1;
      }
      break;

    case 'ArrowDown':
      event.preventDefault();
      if (row < maxRow) {
        const downIndex = index + cols;
        if (downIndex < itemCount) {
          newIndex = downIndex;
        }
      }
      break;

    case 'ArrowUp':
      event.preventDefault();
      if (row > 0) {
        newIndex = index - cols;
      }
      break;

    case 'Home':
      event.preventDefault();
      if (ctrlKey) {
        newIndex = 0;
      } else {
        // Move focus to the first cell in *this* row
        newIndex = row * cols;
      }
      break;

    case 'End':
      event.preventDefault();
      if (ctrlKey) {
        newIndex = itemCount - 1;
      } else {
        // last cell in the current row (but do not exceed itemCount)
        const endOfRowIndex = row * cols + (cols - 1);
        newIndex = Math.min(endOfRowIndex, itemCount - 1);
      }
      break;

    case 'PageDown':
      event.preventDefault();
      {
        const skipRows = 3;
        const pageDownIndex = index + cols * skipRows;
        newIndex = Math.min(pageDownIndex, itemCount - 1);
      }
      break;

    case 'PageUp':
      event.preventDefault();
      {
        const skipRows = 3;
        const pageUpIndex = index - cols * skipRows;
        newIndex = Math.max(pageUpIndex, 0);
      }
      break;

    default:
      return; // let other keys pass
  }

  moveFocusToCell(newIndex);
}


/**
 * Programmatically sets focus on the chosen index and 
 * updates `focusedCellIndex` so only that cell has tabindex=0.
 */
function moveFocusToCell(newIndex) {
  if (newIndex < 0) newIndex = 0;
  if (newIndex >= searchvehicles.value.length) {
    newIndex = searchvehicles.value.length - 1;
  }
  focusedCellIndex.value = newIndex;

  // Next tick ensures DOM is updated so the cell with tabindex=0 is present
  nextTick(() => {
    const cells = document.querySelectorAll('.vehicle-details[role="gridcell"]');
    if (cells[focusedCellIndex.value]) {
      cells[focusedCellIndex.value].focus();
    }
  });
}

/**
 * Watches the `window.site?.domain` variable and invokes `fetchData` when it becomes truthy.
 */
watch(() => window.site?.domain, (newVal, oldVal) => {
  if (newVal) {
    fetchData();
  }
});

const searchvehicles = computed(() => {

  if (undefined !== window.pluginCleanbc && false === globalPluginDirFlag) {
    globalPluginDirFlag = true;
    cleanBCLogo = ref(`${window.pluginCleanbc.pluginDir}/blocks/vue-blocks/src/assets/go_electric_cleanbc_logo.png`);
    cleanBCLeaf = ref(`${window.pluginCleanbc.pluginDir}/blocks/vue-blocks/src/assets/leaf-icon-01.png`);
    placeholderImg = ref(`${window.pluginCleanbc.pluginDir}/blocks/vue-blocks/src/assets/image-unavailable.png`);
  }

  let result = vehicles.value;

  if (!filterValue.value && rangeValue.value[1] === 70000 && rangeValue.value[0] === 28000) {
    return result;
  }
  let filterValueLowerCase = filterValue.value.toLowerCase();
  let maxPriceRange = parseInt(rangeValue.value[1]);
  let minPriceRange = parseInt(rangeValue.value[0]);

  return result.filter((vehicle) => {
    let actualVehiclePriceMin = parseInt(vehicle.minMsrp);
    let actualVehiclePriceMax = vehicle.maxMsrp === 0 ? actualVehiclePriceMin : parseInt(vehicle.maxMsrp);

    if (minPriceRange < 29500 && vehicle.make === 'Smart' && filterValueLowerCase === '') {
      return true;
    }

    if (minPriceRange > actualVehiclePriceMax) {
      return false;
    }
    if (maxPriceRange < actualVehiclePriceMin) {
      return false;
    }
    if (minPriceRange < actualVehiclePriceMin && maxPriceRange < actualVehiclePriceMax) {
      return true;
    }
    if (minPriceRange > actualVehiclePriceMin && maxPriceRange > actualVehiclePriceMax) {
      return true;
    }

    const yearMatch = vehicle.year.some((year) => 
      year.toString().includes(filterValue.value)
    );

    return (
      vehicle.make.toLowerCase().includes(filterValueLowerCase) ||
      vehicle.model.toLowerCase().includes(filterValueLowerCase) ||
      vehicle.type.toLowerCase().includes(filterValueLowerCase) ||
      yearMatch
    );
  });
});

const getEVArray = () => {
  fetch(vehiclesAPI, { cache: 'no-store' })
    .then((r) => r.json())
    .then((json) => {
      vehicles.value = json;
      vehicles.value.sort((a, b) => a.model.toLowerCase().localeCompare(b.model.toLowerCase()));
      vehicleTypes.value = [...new Set(vehicles.value.map(vehicle => vehicle.type))]; // array of unique EV types.
    })
    .catch((error) => {
      console.error('Error fetching vehicle data:', error);
    });
};

const changeOrder = (val) => {
  let selection = val;
  
  // Update reactive references based on selection
  isMake.value = selection === 'make';
  isModel.value = selection === 'model';
  isMSRP.value = selection === 'msrp';
  isClass.value = selection === 'class';
  isRebate.value = selection === 'rebate';
  isType.value = selection === 'type';
  isYear.value = selection === 'year';
  isElectricRange.value = selection === 'rangeElectric';
  isFullRange.value = selection === 'rangeFull';

  // Hash map of sorting functions
  const sortFunctions = {
    make: (a, b) => a.make.localeCompare(b.make),
    model: (a, b) => a.model.toLowerCase().localeCompare(b.model.toLowerCase()),
    msrp: (a, b) => b.minMsrp - a.minMsrp,
    class: (a, b) => a.vehicle_class.localeCompare(b.vehicle_class),
    rebate: (a, b) =>
      (b.rebate_provincial + b.rebate_federal) -
      (a.rebate_provincial + a.rebate_federal),
    type: (a, b) => a.type.localeCompare(b.type),
    year: (a, b) => b.year - a.year,
    rangeElectric: (a, b) =>
      parseInt(b.rangeElectricKm) - parseInt(a.rangeElectricKm),
    rangeFull: (a, b) => {
      const aRange = a.rangeFullKm || a.rangeElectricKm;
      const bRange = b.rangeFullKm || b.rangeElectricKm;
      return parseInt(bRange) - parseInt(aRange);
    },
  };

  // Validate selection and apply sorting
  if (sortFunctions[selection]) {
    vehicles.value.sort(sortFunctions[selection]);
  }
};

// Watch for changes and update aria-live only when searchvehicles changes
watch(searchvehicles, async () => {
  await nextTick(); // Wait for DOM updates
  ariaLiveMessage.value = `${searchvehicles.value.length} of ${vehicles.value.length}`;
});

onMounted(async () => {

  window.addEventListener('resize', handleResize);
  // Call once to set initial columnCount
  handleResize();

  const appElement = document.getElementById('vehicleFilterApp');
  const showFederalRebates = appElement.getAttribute('data-show-federal-rebates') === 'false';
  isFederalRebate.value = !showFederalRebates;
  
  getEVArray();
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', handleResize);
});
</script>

<style lang="scss" scoped>
$breakpoint-xxs: 0;
$breakpoint-xs: 479px;
$breakpoint-sm: 767px;
$breakpoint-md: 991px;
$breakpoint-md-lg: 1024px;
$breakpoint-lg: 1199px;

$external_link_icon_dark: url(data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDI2LjAuMiwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IkxheWVyXzEiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgeG1sbnM6eGxpbms9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkveGxpbmsiIHg9IjBweCIgeT0iMHB4IgoJIHZpZXdCb3g9IjAgMCAxOCAxOCIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMTggMTg7IiB4bWw6c3BhY2U9InByZXNlcnZlIj4KPHN0eWxlIHR5cGU9InRleHQvY3NzIj4KCS5zdDB7ZmlsbC1ydWxlOmV2ZW5vZGQ7Y2xpcC1ydWxlOmV2ZW5vZGQ7ZmlsbDojMDAyQTRFO30KPC9zdHlsZT4KPHBhdGggY2xhc3M9InN0MCIgZD0iTTkuNywzLjljMC0wLjEtMC4xLTAuMy0wLjItMC40QzkuNCwzLjQsOS4zLDMuNCw5LjIsMy40SDEuN2MtMC40LDAtMC45LDAuMi0xLjIsMC41QzAuMiw0LjIsMCw0LjYsMCw1LjF2MTEuMgoJYzAsMC40LDAuMiwwLjksMC41LDEuMkMwLjgsMTcuOCwxLjIsMTgsMS43LDE4aDExLjJjMC40LDAsMC45LTAuMiwxLjItMC41YzAuMy0wLjMsMC41LTAuNywwLjUtMS4yVjguOGMwLTAuMS0wLjEtMC4zLTAuMi0wLjQKCWMtMC4xLTAuMS0wLjItMC4yLTAuNC0wLjJjLTAuMSwwLTAuMywwLjEtMC40LDAuMmMtMC4xLDAuMS0wLjIsMC4yLTAuMiwwLjR2Ny41YzAsMC4xLTAuMSwwLjMtMC4yLDAuNGMtMC4xLDAuMS0wLjIsMC4yLTAuNCwwLjIKCUgxLjdjLTAuMSwwLTAuMy0wLjEtMC40LTAuMmMtMC4xLTAuMS0wLjItMC4yLTAuMi0wLjRWNS4xYzAtMC4xLDAuMS0wLjMsMC4yLTAuNGMwLjEtMC4xLDAuMi0wLjIsMC40LTAuMmg3LjUKCWMwLjEsMCwwLjMtMC4xLDAuNC0wLjJDOS43LDQuMiw5LjcsNC4xLDkuNywzLjl6Ii8+CjxwYXRoIGNsYXNzPSJzdDAiIGQ9Ik0xOCwwLjZjMC0wLjEtMC4xLTAuMy0wLjItMC40QzE3LjcsMC4xLDE3LjYsMCwxNy40LDBoLTUuNmMtMC4xLDAtMC4zLDAuMS0wLjQsMC4yYy0wLjEsMC4xLTAuMiwwLjItMC4yLDAuNAoJczAuMSwwLjMsMC4yLDAuNGMwLjEsMC4xLDAuMiwwLjIsMC40LDAuMmg0LjNsLTkuMiw5LjJjLTAuMSwwLjEtMC4xLDAuMS0wLjEsMC4yYzAsMC4xLDAsMC4xLDAsMC4yczAsMC4xLDAsMC4yCgljMCwwLjEsMC4xLDAuMSwwLjEsMC4yQzcsMTEuMSw3LDExLjIsNy4xLDExLjJjMC4xLDAsMC4xLDAsMC4yLDBjMC4xLDAsMC4xLDAsMC4yLDBzMC4xLTAuMSwwLjItMC4xbDkuMi05LjJ2NC4zCgljMCwwLjEsMC4xLDAuMywwLjIsMC40YzAuMSwwLjEsMC4yLDAuMiwwLjQsMC4yYzAuMSwwLDAuMy0wLjEsMC40LTAuMkMxNy45LDYuNSwxOCw2LjMsMTgsNi4yVjAuNnoiLz4KPC9zdmc+Cg==);

:root {
	--mineshaft: #333;
	--scorpiongrey: #484747;
	--dovegrey: #656565;
	--gallerygray: #edebeb;
	--vehiclegrey: #ccc;
	--prussianblue: #002a4e;

	--bahamablue: #369;
	--bondiblue: #007e9e;
	--eucalyptus: #1d8045;
	--porcelain: #dcdcdc;
	--white: #fff;
	--snow: var(--white);
}

#vehicleFilterApp {
  color: var(--mineshaft);
  width: 100%;
  z-index: 9;

  h3 {
    color: var(--bahamablue);
    font-weight: 700;
    font-size: 1.5rem;
    text-align: left;
    margin: 0 0 1rem 1rem;
  }

}

.form-control {
  display: block;
  width: 100%;
  height: 2.125rem;
  padding: 0.375rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.42857143;
  color: var(--mineshaft);
  background-color: var(--gallerygray);
  background-image: none;
  border: 1px solid var(--vehiclegrey);
  border-radius: 4px;
  box-shadow: inset 0 1px 1px rgba(0, 0, 0, 0.075);
}

.type-key {
  padding: 2rem 1rem 0;
  color: var(--prussianblue);
  line-height: 1.5;
  text-align: flex-start;
  width: 100%;

  span {
    color: var(--bahamablue);
    font-size: 0.813rem;
  }
}

#vue-app {
  top: 45vh;

  @media (max-width: $breakpoint-sm) {
    top: 80vh;
  }
}

.flex-container {

  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  max-width: 1440px;
  width: 100%;

  .row {
    max-width: 1440px;
    width: 100%;

    display: flex;
    flex-direction: row;
    align-content: center;
    justify-content: flex-start;
    align-items: stretch;
    flex-wrap: wrap;
    transition: transform 0.5s cubic-bezier(0.65, 0.05, 0.36, 1);

    .headline {

      h2 {
        color: var(--bondiblue);
        font-weight: 900;
        font-size: 3.125;
        text-align: right;

        @media (max-width: $breakpoint-sm) {
          text-align: center;
          font-size: 5vw;
        }

        @media (max-width: $breakpoint-xs) {
          font-size: 8vw;
        }
      }
    }

    .content {

      p {
        color: var(--prussianblue);
        font-size: 1rem;
        line-height: 1.25;
        text-align: left;

        @media (max-width: $breakpoint-sm) {
          text-align: center;
          font-size: 4vw;
          line-height: 1.25;
        }

        @media (max-width: $breakpoint-xs) {
          font-size: 5vw;
          line-height: 1.25;
          padding: 1rem;
        }

        span {
          font-weight: 900;
        }

        br {

          @media (max-width: $breakpoint-md) {
            display: none;
          }
        }
      }
    }

    .filter-container {
      max-width: 25%;

      @media (max-width: $breakpoint-md-lg) {
        min-width: 33%;
        max-width: 33%;
      }

      @media (max-width: $breakpoint-md) {
        min-width: 50%;
        max-width: 50%;
      }

      @media (max-width: 640px) {
        min-width: 100%;
        max-width: 100%;
      }

      flex: 1;
      padding: 1rem;

      @media (max-width: $breakpoint-lg) {
        padding: 2rem;
      }

      @media (max-width: 360px) {
        padding: 2rem;
      }

      background-color: var(--snow);
      box-shadow: 0 4px 12px color-mix(in srgb, var(--mineshaft) 25%, transparent);
      border: 0;
      border-radius: 0.66rem;

      .logo-img {
        width: 80%;
        max-width: 230px;
        display: block;
        margin: 1rem auto 0;
        cursor: pointer;
      }

      h3 {
        color: var(--bahamablue);
        font-weight: 700;
        font-size: 1.25rem !important;
        text-align: center;
        margin: 0;
      }

      h4 {
        color: var(--prussianblue);
        text-align: center;
      }

      .msrp-range-slider {
        margin: 0;
      }

      .msrp-range {
        color: var(--bahamablue);
        font-weight: 700;
        margin: 0;
      }

      .msrp-link {
        font-size: 80%;
        line-height: 1.5;
        text-align: left;

        a {
          text-decoration: none;
          color: var(--mineshaft);

          &:hover,
          &:focus {
            color: var(--bondiblue);
          }
        }
      }

      .max-msrp {
        font-size: 110%;
        position: relative;
        top: 1px;
        color: var(--bahamablue);
      }

      &.filter-container-desktop {
        display: block;
        max-width: 100%;
        min-width: 100%;
        width: 100%;

        .filter-flex-container {

          display: flex;
          flex-direction: row;
          max-width: 100%;
          min-width: 100%;
          width: 100%;
        }

        .flex-group {

          flex: 1;
          width: 25%;
          max-width: 25%;
          padding: 0 2rem;
          height: fit-content;

          @media (max-width: $breakpoint-lg) {
            width: 33%;
            max-width: 33%;
          }
        }

        h3 {
          padding: 0 2rem;
          text-align: left;
          font-size: 1.35rem;
        }

        h4 {
          text-align: left;
          margin-bottom: 1rem;

          .type-key {
            font-weight: 400;
            font-size: 115%;
            padding: 4rem 2rem !important;
            text-align: right;
          }

          span {
            font-size: 90%;
            font-weight: 400;
            color: var(--bondiblue);
          }
        }

        .msrp-range {
          font-size: 120% !important;
          text-align: left;

          span {
            font-size: 95% !important;
            text-align: right;
            float: right;
          }
        }

        .msrp-link {
          font-size: 80%;
          text-align: left;

          a {
            text-decoration: none;
            color: var(--mineshaft);

            &:hover,
            &:focus {
              color: var(--bondiblue);
            }
          }
        }

        .type-key {
          font-size: 1rem;
          padding: 0 !important;
          color: var(--prussianblue);
          text-align: left;
          width: 100%;
          margin-block: 0;

          span {
            color: var(--bahamablue);
          }
        }

        .filter-header {
          text-align: center !important;
        }

        button {
          max-width: 23%;
        }
      }
    }

    .vehicle-details {
      border-top: 1px solid color-mix(in srgb, var(--bondiblue) 15%, transparent);
      max-width: 25%;
      width: 25%;
      --column-count: 4;

      @media (max-width: $breakpoint-md-lg) {
        max-width: 33%;
        width: 33%;
        --column-count: 3;
      }

      @media (max-width: $breakpoint-md) {
        max-width: 50%;
        width: 50%;
        --column-count: 2;
      }

      @media (max-width: $breakpoint-xs) {
        max-width: 100%;
        width: 100%;
        --column-count: 1;
      }

      display: flex;
      flex: 1 0 auto;
      flex-direction: column;
      justify-content: flex-start;
      align-content: center;
      line-height: 1.5;
      margin-bottom: 0;
      padding: 3rem;
      text-decoration: none;

      a {
        color: var(--eucalyptus);
        font-size: 1.1rem;
        line-height: 1.3;
        text-decoration: none;

        &::after {
          content: none;
        }

        &:hover,
        &.focus {
          color: var(--prussianblue);

          strong {
            color: var(--prussianblue) !important;
          }
        }

        span {

          strong {
            color: var(--eucalyptus) !important;
          }

        }
      }

      .btn-primary {
        background-color: var(--prussianblue);
        background-size: 300%;
        border-radius: 3px;
        border: 1px solid var(--prussianblue);
        color: var(--snow);
        cursor: pointer;
        max-width: 20rem;
        white-space: normal;
        font-size: 1rem;
        line-height: 1;
        padding: 0.75rem 1rem;
        text-decoration: none;

        &:hover,
        &:focus {
          background-color: var(--snow);
          color: var(--prussianblue);
        }
      }

      .ev-img {
        margin: 0 auto 2rem;

        img {
          width: 100%;
        }
      }

      div.no-content {
        img {
          position: relative;
          left: 25%;
          scale: 75%;
        }
      }

      h3.no-content {
        font-size: 1.4rem;
        color: var(--bahamablue);
        font-weight: 700;
        padding: 0;
        margin: 0 !important;
      }

      p.no-content {
        font-size: 1rem;
        color: var(--prussianblue);
      }

      hr.hr {
        border: 1px solid var(--dovegrey);
        width: 20%;
        margin: 10px 0;
      }

      p {
        color: var(--scorpiongrey);
        font-size: 2rem;
        line-height: 1.5;

        span {
          font-size: 1.1rem;
          display: inline-block;

          &.highlight {
            display: block;
            color: var(--bahamablue);
            font-weight: 700;
          }

          strong {
            color: var(--bondiblue);
          }

          &.model {
            display: block !important;
            font-size: 1.5rem;
            font-weight: 700;
            color: var(--prussianblue);
            margin-bottom: 0;
          }

          &.year {
            display: block !important;
            font-size: 1.15;
            font-weight: 700;
            color: var(--bondiblue);
            margin-top: 0;
          }

          &.msrp {
            font-size: 1.2rem;
            color: var(--bahamablue);
          }
        }

        &.rebate-content {
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--bahamablue);
          margin: 0;
        }
      }
    }
  }

  .filter-flex-container {

    display: flex;
    justify-content: space-around;
    align-content: center;
    flex-direction: column;
    width: 100%;

    .flex-group {

      display: flex;
      flex-direction: column;
      align-content: center;
      justify-content: flex-start;
      text-align: center;

      h4 {
        margin-top: 0.5rem;

        small {
          font-weight: 300;
        }
      }

      .vue-slider {
        padding: 9px 1rem !important;
      }

      .flex-group-filters {

        display: flex;
        flex-direction: column;

        .btn-group-horizontal {

          display: flex;
          flex-direction: row;
          justify-content: flex-start;

          &:first-of-type {
            border-top: 1px solid var(--vehiclegrey);
          }
        }

        .filter-header {
          color: var(--prussianblue);
          padding: 7px;
          display: inline-block;
          font-size: 0.75rem;
          font-weight: 300;
          width: 30%;
          text-align: right;
        }

        button {
          background-color: var(--porcelain);
          border: 1px solid var(--vehiclegrey);
          border-radius: 0;
          cursor: pointer;
          margin: 0;
          padding: 0.5rem 0 calc(0.5rem + 4px);
          white-space: wrap;
          width: 35%;

          &:hover,
          &:focus {
            background-color: var(--dovegrey);
            color: var(--snow);
          }

          &.active {
            background-image: linear-gradient(0deg, var(--bondiblue) 12%, var(--prussianblue) 12%);
            color: var(--white);
          }

          &.btn-25 {
            border-left: 0;

            &:first-of-type {
              border-left: 1px solid var(--vehiclegrey);
            }

            max-width: 25%;
            min-width: 25%;
            width: 25%;
          }

          &.btn-33 {
            border-left: 0;
            border-top: 0;

            &:first-of-type {
              border-left: 1px solid var(--vehiclegrey);
            }

            max-width: 33.33%;
            min-width: 33.33%;
            width: 33.33%;
          }

          &.btn-37 {
            border-left: 0;
            border-top: 0;

            &:first-of-type {
              border-left: 1px solid var(--vehiclegrey);
            }

            max-width: 37.5%;
            min-width: 37.5%;
            width: 37.5%;
          }

          &.btn-50 {
            border-left: 0;
            border-top: 0;

            &:first-of-type {
              border-left: 1px solid var(--vehiclegrey);
            }

            max-width: 50%;
            min-width: 50%;
            width: 50%;
          }
        }
      }
    }
  }
}

#feature-image {
  max-width: 280px;
  margin: auto;
}

.menu-items {
  overflow: auto;
  max-height: 100vh;
}

.disclaimer {
  padding: 3rem 0 6rem;
}

.feature-banner {
  display: none;
}

#feature-image {
  max-width: 280px;
  margin: auto;
}

.menu-items {
  overflow: auto;
  max-height: 100vh;
}

/* component style */
.vue-slider-disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* rail style */
.vue-slider-rail {
  background-color: var(--vehiclegrey);
  border-radius: 15px;
}

/* process style */
.vue-slider-process {
  background-color: var(--bondiblue);
  border-radius: 15px;
  height: 4px !important;
}

/* mark style */
.vue-slider-mark {
  z-index: 4;
}

.vue-slider-mark:first-child .vue-slider-mark-step,
.vue-slider-mark:last-child .vue-slider-mark-step {
  display: none;
}

.vue-slider-mark-step {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.16);
}

.vue-slider-mark-label {
  font-size: 0.875rem;
  white-space: nowrap;
}

/* dot style */
.vue-slider-dot-handle {
  cursor: pointer;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background-color: #fff;
  box-sizing: border-box;
  box-shadow: 0.5px 0.5px 2px 1px rgba(0, 0, 0, 0.32);
}

.vue-slider-dot-handle-focus {
  box-shadow: 0 0 1px 2px rgba(52, 152, 219, 0.36);
}

.vue-slider-dot-handle-disabled {
  cursor: not-allowed;
  background-color: var(--vehiclegrey);
}

.vue-slider-dot-tooltip-inner {
  font-size: 0.875rem;
  white-space: nowrap;
  padding: 2px 5px;
  min-width: 20px;
  text-align: center;
  color: #fff;
  border-radius: 5px;
  border-color: var(--bondiblue);
  background-color: var(--bondiblue);
  box-sizing: content-box;
}

.vue-slider-dot-tooltip-inner::after {
  content: "";
  position: absolute;
}

.vue-slider-dot-tooltip-inner-top::after {
  top: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-top-color: inherit;
}

.vue-slider-dot-tooltip-inner-bottom::after {
  bottom: 100%;
  left: 50%;
  transform: translate(-50%, 0);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-bottom-color: inherit;
}

.vue-slider-dot-tooltip-inner-left::after {
  left: 100%;
  top: 50%;
  transform: translate(0, -50%);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-left-color: inherit;
}

.vue-slider-dot-tooltip-inner-right::after {
  right: 100%;
  top: 50%;
  transform: translate(0, -50%);
  height: 0;
  width: 0;
  border-color: transparent;
  border-style: solid;
  border-width: 5px;
  border-right-color: inherit;
}

.vue-slider-dot-tooltip-wrapper {
  opacity: 0;
  transition: all 0.3s;
}

.vue-slider-dot-tooltip-wrapper-show {
  opacity: 1;
}

/**
DUMP
*/

/* FEEDBACK BUTTON */
.feedback-container {
  max-width: 1440px;
  margin: 2rem auto 0;
  white-space: nowrap;
}

.btn.btn-white {
  background: var(--snow);
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.15);
  margin: 0 2rem;
  padding: 1.5rem;
  white-space: nowrap;
  font-size: 1rem;
  text-decoration: none !important;
  letter-spacing: 0.2px;
}

.body-wrap,
div.bcgov-marketing-page,
.no-scroll {
  overflow: hidden;
}

div.bcgov-marketing-page {
  margin-top: 64px;
}

@media (max-width: $breakpoint-sm) {

  div.bcgov-marketing-page {
    margin-top: 0;
  }
}

#custom-script-section {
  height: 0;
  padding: 0;
  margin: 0;
}
</style>