import { shallowMount, mount, RouterLinkStub } from "@vue/test-utils";
import { describe, expect, it, vi } from "vitest";
import Header from "../header/header.vue";
import autoSearch from "../auto-search/auto-search.vue";
import { i18n } from "../../plugins/i18n";
import axios from "axios";

describe("Header ", () => {
  let wrapper;

  let countryData = [
    { id: "IND", name: "India", countryAlpha2Code: "IN" },
    { id: "USA", name: "United States of America", countryAlpha2Code: "US" },
    { id: "POL", name: "Poland", countryAlpha2Code: "PL" },
    { id: "AUS", name: "Australia", countryAlpha2Code: "AU" },
  ];
  const axiosGetSpy = vi.spyOn(axios, "get");
  axiosGetSpy.mockResolvedValue({ data: countryData });

  it("should have the data", () => {
    wrapper = shallowMount(Header, { i18n });
    expect(wrapper.vm.countries).to.deep.equal({});
    expect(wrapper.vm.developmentIndicators).to.deep.equal([]);
    expect(wrapper.vm.healthIndicators).to.deep.equal({});
  });

  it("should have the data", () => {
    wrapper = mount(Header, {
      stubs: {
        "router-link": RouterLinkStub,
        "router-view": {
          render: (h) => h(autoSearch),
        },
      },
      i18n,
    });
    expect(wrapper.findAll(".hd-element").length).to.equal(6);
    expect(wrapper.findAll(autoSearch).length).to.equal(2);
  });
});
