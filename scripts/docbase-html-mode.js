/**
 *
 * Docbase engine
 * Appbase
 * MIT license
 */

(function($, angular) {
    /*
     * Scrollspy.
     */
    $(function() {
        $("h2, h3").scrollagent(function(cid, pid, currentElement, previousElement) {
            if (pid) {
                $("[pref='#" + pid + "']").removeClass('active');
            }
            if (cid) {
                $("[pref='#" + cid + "']").addClass('active');
            }
        });
    });
})(window.jQuery, window.angular);
