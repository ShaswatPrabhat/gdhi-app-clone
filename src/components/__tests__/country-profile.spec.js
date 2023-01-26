import { createLocalVue, shallowMount } from "@vue/test-utils";
import flushPromises from "flush-promises";
import { describe, expect, it, beforeEach, vi } from "vitest";
import VueRouter from "vue-router";
import axios from "axios";
import CountryProfile from "../countryProfile/country-profile.vue";
import * as pdfHelper from "../pdfHelper/pdf-generate-scorecard.js";
import { i18n } from "../../plugins/i18n";

describe("Country Profile ", () => {
  let wrapper;
  const localVue = createLocalVue();
  localVue.use(VueRouter);
  const router = new VueRouter();
  const healthIndicatorData = {
    countryId: "IND",
    countryName: "India",
    countryAlpha2Code: "IN",
    overallScore: 3.226190476190476,
    categories: [
      {
        id: 1,
        name: "Leadership and Governance",
        overallScore: 3.0,
        phase: 3,
        indicators: [
          {
            id: 1,
            code: "1",
            name: "Digital health prioritized at the national level through dedicated bodies / mechanisms for governance",
            indicatorDescription:
              "Does the country have a separate department / agency / national working group for digital health?",
            score: 4,
            supportingText: "sdg",
            scoreDescription:
              "Governance structure is fully-functional, government-led, consults with other ministries, and monitors implementation of digital health based on a work plan.",
          },
          {
            id: 2,
            code: "1",
            name: "Digital health prioritized at the national level through dedicated bodies / mechanisms for governance",
            indicatorDescription:
              "Does the country have a separate department / agency / national working group for digital health?",
            score: 4,
            supportingText: "sdg",
            scoreDescription:
              "Governance structure is fully-functional, government-led, consults with other ministries, and monitors implementation of digital health based on a work plan.",
          },
          {
            id: 3,
            code: "1",
            name: "Digital health prioritized at the national level through dedicated bodies / mechanisms for governance",
            indicatorDescription:
              "Does the country have a separate department / agency / national working group for digital health?",
            score: 4,
            supportingText: "sdg",
            scoreDescription:
              "Governance structure is fully-functional, government-led, consults with other ministries, and monitors implementation of digital health based on a work plan.",
          },
        ],
      },
    ],
    countryPhase: 4,
    collectedDate: "January 2018",
  };

  const benchmarkData = {
    1: {
      benchmarkScore: 5,
      benchmarkValue: "above",
    },
    2: {
      benchmarkScore: 3,
      benchmarkValue: "Below",
    },
    3: {
      benchmarkScore: 4,
      benchmarkValue: "At",
    },
  };

  const phaseData = [
    {
      phaseName: "phase1",
      phaseValue: 1,
    },
    {
      phaseName: "phase2",
      phaseValue: 2,
    },
  ];
  const axiosGetSpy = vi.spyOn(axios, "get");
  axiosGetSpy.mockImplementation(async (url) => {
    if (url.includes("countries")) {
      return new Promise((resolve) => resolve({ data: healthIndicatorData }));
    } else {
      return new Promise((resolve) => resolve({ data: phaseData }));
    }
  });

  beforeEach(() => {
    wrapper = shallowMount(CountryProfile, {
      localVue,
      router,
      i18n,
    });
  });

  it("should populate the data after successfull API call", async () => {
    await flushPromises();
    expect(JSON.stringify(wrapper.vm.healthIndicatorData)).to.deep.equal(
      JSON.stringify(healthIndicatorData)
    );
    expect(wrapper.vm.flagSrc).to.deep.equal(
      `/static/img/flags/${healthIndicatorData.countryAlpha2Code.toLowerCase()}.svg`
    );
    wrapper.vm.initialise();
    wrapper.vm.healthIndicatorData.categories.forEach((category) => {
      expect(category["showCategory"]).to.equal(false);
    });
  });

  it("should have the appropriate html elements based on the data", async () => {
    await flushPromises();
    expect(wrapper.find(".country-name").text()).to.equal(
      healthIndicatorData.countryName
    );
    expect(wrapper.find("#collected-date").text()).to.equal(
      `As on: January 2018`
    );
    expect(wrapper.find(".export a").attributes().href).to.equal(
      wrapper.vm.countryDataSheetUrl()
    );
    expect(wrapper.find(".score").text()).to.equal(
      healthIndicatorData.countryPhase.toString()
    );
    expect(wrapper.findAll(".category-bar").length).to.equal(
      healthIndicatorData.categories.length
    );
    const firstCategory = wrapper.findAll(".category-bar").at(0);
    expect(firstCategory.find(".sub-header").text()).to.equal(
      healthIndicatorData.categories[0].name
    );
    expect(firstCategory.findAll(".indicator").length).to.equal(
      healthIndicatorData.categories[0].indicators.length
    );
    const firstIndicator = firstCategory.findAll(".indicator").at(0);
    expect(firstIndicator.find(".indicator-name-value").text()).to.equal(
      healthIndicatorData.categories[0].indicators[0].name
    );
    expect(
      firstIndicator.findAll(".indicator-score-desc").at(0).text()
    ).to.equal(
      healthIndicatorData.categories[0].indicators[0].indicatorDescription
    );
    expect(
      firstIndicator.findAll(".indicator-score-desc").at(1).text()
    ).to.equal(
      healthIndicatorData.categories[0].indicators[0].scoreDescription
    );
    expect(firstIndicator.find(".indicator-score").text()).to.equal(
      healthIndicatorData.categories[0].indicators[0].score.toString()
    );
  });

  it("should updated the showCategory when the category is clicked", async () => {
    await flushPromises();
    const firstCategory = wrapper.findAll(".category-bar").at(0);
    firstCategory.find(".sub-header").trigger("click");
    expect(wrapper.vm.healthIndicatorData.categories[0].showCategory).to.equal(
      true
    );
    firstCategory.find(".sub-header").trigger("click");
    expect(wrapper.vm.healthIndicatorData.categories[0].showCategory).to.equal(
      false
    );
  });

  it("should call generateScorecard with the healthindicator data", async () => {
    await flushPromises();

    wrapper.vm.countrySummary = "Country Summary";
    wrapper.vm.benchmarkPhase = "Global";
    wrapper.vm.benchmarkData = benchmarkData;

    let mockFn = vi.spyOn(pdfHelper, "generateScorecard").mockReturnValue({});

    wrapper.find(".download-btn").trigger("click");
    expect(mockFn.mock.calls[0]).to.deep.equal([
      healthIndicatorData,
      wrapper.vm.countrySummary,
      benchmarkData,
      wrapper.vm.benchmarkPhase,
      wrapper.vm.hasBenchmarkData,
      i18n,
    ]);
  });

  it("should load the benchmark data when the benchmark dropdown is changed when data is present", async () => {
    axiosGetSpy.mockResolvedValueOnce({ data: benchmarkData });
    await flushPromises();

    wrapper.findAll(".benchmarkDropDown option").at(1).element.selected = true;
    wrapper.find(".benchmarkDropDown").trigger("change");
    await flushPromises();
    expect(wrapper.vm.benchmarkData).to.deep.equal(benchmarkData);
    expect(wrapper.findAll(".benchmark-score").length).to.equal(
      Object.keys(benchmarkData).length
    );
    expect(wrapper.findAll(".benchmark-score").at(0).html()).equal(
      '<div class="benchmark-score"><span>Benchmark: 5</span></div>'
    );
    expect(wrapper.findAll(".benchmark-score").at(0).text()).to.equal(
      "Benchmark: " + benchmarkData["1"].benchmarkScore.toString()
    );

    expect(wrapper.findAll(".benchmarkCompare").at(0).text()).to.equal(
      "ABOVE AVG."
    );
    expect(wrapper.findAll(".benchmarkCompare").at(1).text()).to.equal(
      "BELOW AVG."
    );
    expect(wrapper.findAll(".benchmarkCompare").at(2).text()).to.equal(
      "AT AVG."
    );
  });

  it("should reset the benchmark data to empty object when no value is selected", async () => {
    await flushPromises();
    wrapper.findAll(".benchmarkDropDown option").at(0).element.selected = true;
    wrapper.find(".benchmarkDropDown").trigger("change");
    await flushPromises();
    expect(wrapper.vm.benchmarkData).to.deep.equal({});
    expect(wrapper.findAll(".benchmark-score").length).to.equal(0);
  });

  it("should load the benchmark data when the benchmark dropdown is changed when no data for country is present", async () => {
    let notifier = vi.fn();
    wrapper.vm.$notify = notifier;
    await flushPromises();
    axiosGetSpy.mockResolvedValueOnce({ data: {} });

    wrapper.findAll(".benchmarkDropDown option").at(1).element.selected = true;
    wrapper.find(".benchmarkDropDown").trigger("change");

    await flushPromises();

    expect(wrapper.vm.benchmarkData).to.deep.equal({});
    expect(wrapper.findAll(".benchmark-score").length).to.equal(0);
    notifier.mockReturnValue({
      group: "custom-template",
      title: "No Data",
      text: "No countries in the selected phase for benchmarking",
      type: "warn",
    });
  });

  it("should call error notifier when the benchmark API call is failed", async () => {
    let notifier = vi.fn();
    wrapper.vm.$notify = notifier;
    wrapper.findAll(".benchmarkDropDown option").at(1).element.selected = true;
    axiosGetSpy.mockRejectedValueOnce({ data: { message: "problem" } });
    wrapper.find(".benchmarkDropDown").trigger("change");
    await flushPromises();
    expect(wrapper.vm.benchmarkData).to.deep.equal({});
    expect(wrapper.findAll(".benchmark-score").length).to.equal(0);
    notifier.mockReturnValue({
      group: "custom-template",
      title: "Server Error",
      text: "Unable to load benchmark data. Please try after sometime",
      type: "error",
    });
  });

  it(" should fetch phases", async () => {
    wrapper.vm.fetchPhases();

    await flushPromises();
    expect(wrapper.vm.phases).to.deep.equal(phaseData);
  });

  it(" Update the countries summary on the function call", () => {
    wrapper.vm.onSummaryLoaded("Demo Text");
    expect(wrapper.vm.countrySummary).to.equal("Demo Text");
  });

  it("should render collected on date", async () => {
    await flushPromises();
    expect(wrapper.vm.collectedDate).to.equal("As on: January 2018");
  });

  it("should render localization texts properly", async () => {
    await flushPromises();
    expect(wrapper.find(".export").find("a").text()).equal(
      i18n.messages.en.countryProfile.exportCountryDataButton
    );

    expect(wrapper.find(".download-btn").text()).equal(
      i18n.messages.en.countryProfile.downloadScorecard
    );

    expect(wrapper.findAll(".title .sub-header").at(0).text()).equal(
      i18n.messages.en.countryProfile.overallDigitalHealthPhase
    );

    expect(wrapper.findAll(".phase-desc").at(0).find("p").text()).equal(
      i18n.messages.en.countryProfile.overallDigitalHealthPhaseDescription
    );

    expect(wrapper.find(".benchmark-dropdown-container").text()).equal(
      i18n.messages.en.countryProfile.benchmark.text
    );

    expect(
      wrapper.find(".benchmarkDropDown").findAll("option").at(1).text()
    ).equal(
      i18n.messages.en.countryProfile.benchmark.benchmarkValues.globalAverage
    );

    expect(
      wrapper.find(".benchmarkDropDown").findAll("option").at(2).text()
    ).equal("Phase 1");

    expect(wrapper.findAll(".phase-desc").at(1).find("p").text()).equal(
      i18n.messages.en.countryProfile.benchmark.benchmarkDescription
    );

    expect(
      wrapper
        .findAll(".indicator-panel-container-category-section-phase")
        .at(0)
        .element.attributes.getNamedItem("data-phase").value
    ).equal("Phase 3");

    expect(wrapper.find(".indicator-name").text()).equal(
      i18n.messages.en.countryProfile.indicator
    );
  });

  it("should render localization benchmark error text", async () => {
    wrapper.setData({ hasBenchmarkData: false });
    await flushPromises();
    expect(wrapper.findAll(".phase-desc").at(1).find("span").text()).equal(
      i18n.messages.en.countryProfile.benchmark
        .benchmarkNoCountryForSelectedPhase
    );
  });
});
