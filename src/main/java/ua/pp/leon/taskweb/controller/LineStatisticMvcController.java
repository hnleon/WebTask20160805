package ua.pp.leon.taskweb.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import ua.pp.leon.taskweb.domain.LineStatistic;
import ua.pp.leon.taskweb.repository.LineStatisticRepository;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
@Controller
public class LineStatisticMvcController {

    @RequestMapping("/lineStatistic")
    public String lineStatisticAll(Model model) {
        model.addAttribute("lineStatistic", lineStatisticRepository.findAll());
        return "lineStatistic";
    }

    @RequestMapping("/lineStatistic/{fileId}")
    public String fileStatistic(Model model, @PathVariable Long fileId) {
        Iterable<LineStatistic> all = lineStatisticRepository.findByFileId(fileId);
        model.addAttribute("lineStatistic", all);
        return "lineStatistic";
    }

    @Autowired
    private LineStatisticRepository lineStatisticRepository;
}
