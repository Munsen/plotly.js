var Plots = require('@src/plots/plots');
var Lib = require('@src/lib');

var supplyDefaults = require('@src/traces/histogram2d/defaults');
var calc = require('@src/traces/histogram2d/calc');


describe('Test histogram2d', function() {
    'use strict';

    describe('supplyDefaults', function() {
        var traceIn,
            traceOut;

        beforeEach(function() {
            traceOut = {};
        });

        it('should set zsmooth to false when zsmooth is empty', function() {
            traceIn = {};
            supplyDefaults(traceIn, traceOut, {});
            expect(traceOut.zsmooth).toBe(false);
        });

        it('doesnt step on zsmooth when zsmooth is set', function() {
            traceIn = {
                zsmooth: 'fast'
            };
            supplyDefaults(traceIn, traceOut, {});
            expect(traceOut.zsmooth).toBe('fast');
        });

        it('should set xgap and ygap to 0 when xgap and ygap are empty', function() {
            traceIn = {};
            supplyDefaults(traceIn, traceOut, {});
            expect(traceOut.xgap).toBe(0);
            expect(traceOut.ygap).toBe(0);
        });

        it('shouldnt step on xgap and ygap when xgap and ygap are set', function() {
            traceIn = {
                xgap: 10,
                ygap: 5
            };
            supplyDefaults(traceIn, traceOut, {});
            expect(traceOut.xgap).toBe(10);
            expect(traceOut.ygap).toBe(5);
        });

        it('shouldnt coerce gap when zsmooth is set', function() {
            traceIn = {
                xgap: 10,
                ygap: 5,
                zsmooth: 'best'
            };
            supplyDefaults(traceIn, traceOut, {});
            expect(traceOut.xgap).toBe(undefined);
            expect(traceOut.ygap).toBe(undefined);
        });

    });


    describe('calc', function() {
        function _calc(opts) {
            var base = { type: 'histogram2d' },
                trace = Lib.extendFlat({}, base, opts),
                gd = { data: [trace] };

            Plots.supplyDefaults(gd);
            var fullTrace = gd._fullData[0];

            var out = calc(gd, fullTrace);
            delete out.trace;
            return out;
        }

        // remove tzJan/tzJuly when we move to UTC
        var oneDay = 24 * 3600000,
            tzJan = (new Date(1970, 0, 1)).getTimezoneOffset(),
            tzJuly = (new Date(1970, 6, 1)).getTimezoneOffset();

        it('should handle both uniform and nonuniform date bins', function() {
            var out = _calc({
                x: ['1970-01-01', '1970-01-01', '1970-01-02', '1970-01-04'],
                nbinsx: 4,
                y: ['1970-01-01', '1970-01-01', '1971-01-01', '1973-01-01'],
                nbinsy: 4
            });

            expect(out.x0).toBe('1970-01-01');
            expect(out.dx).toBe(oneDay);

            // TODO: even though the binning is done on non-uniform bins,
            // the display makes them linear (using only y0 and dy)
            // when we sort out https://github.com/plotly/plotly.js/issues/1151
            // lets also make it display the bins with nonuniform size,
            // and ensure we don't generate an extra bin on the end (see
            // first row of z below)
            expect(out.y0).toBe(tzJan === tzJuly ? '1969-07-02 14:24' : '1969-07-02 15:24');
            expect(out.dy).toBe(365.2 * oneDay);

            expect(out.z).toEqual([
                [0, 0, 0, 0],
                [2, 0, 0, 0],
                [0, 1, 0, 0],
                [0, 0, 0, 0],
                [0, 0, 0, 1]
            ]);
        });
    });
});
