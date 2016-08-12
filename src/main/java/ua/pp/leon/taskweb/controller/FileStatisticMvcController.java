package ua.pp.leon.taskweb.controller;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.RequestMapping;
import ua.pp.leon.taskweb.domain.FileStatistic;
import ua.pp.leon.taskweb.repository.FileStatisticRepository;

/**
 *
 * @author Andrii Zalevskyi <azalevskyi@gmail.com>
 */
@Controller
public class FileStatisticMvcController {

    @RequestMapping("/fileStatistic")
    public String FileStatistic(Model model) {
        Iterable<FileStatistic> all = this.fileStatisticRepository.findAll();
        model.addAttribute("fileStatistic", all);
        return "fileStatistic";
    }

    @Autowired
    private FileStatisticRepository fileStatisticRepository;
}
